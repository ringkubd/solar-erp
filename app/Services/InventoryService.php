<?php

namespace App\Services;

use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public static array $discreteUnits = ['pcs', 'unit', 'nos', 'box', 'packet', 'set', 'each'];

    /**
     * Throw exception if quantity is fractional for a discrete item.
     */
    public function validateQuantity(InventoryItem $item, float $quantity): void
    {
        if (in_array(strtolower($item->unit), self::$discreteUnits)) {
            if (floor($quantity) != $quantity) {
                throw new \Exception("Item '{$item->name}' is measured in '{$item->unit}' and cannot have fractional quantities (provided: {$quantity}).");
            }
        }
    }

    /**
     * Record a stock movement (IN or OUT) with multi-warehouse support and costing.
     */
    public function recordMovement(array $data): StockMovement
    {
        return DB::transaction(function () use ($data) {
            $item = InventoryItem::findOrFail($data['inventory_item_id']);
            $this->validateQuantity($item, $data['quantity']);
            
            $warehouseId = $data['warehouse_id'] ?? null;
            
            if (!$warehouseId) {
                // Default to first active warehouse if none provided
                $warehouseId = Warehouse::where('is_active', true)->first()?->id;
                if (!$warehouseId) throw new \Exception("No active warehouse found.");
            }

            if ($data['type'] === 'out') {
                $stockInWarehouse = $item->stockInWarehouse($warehouseId);
                if ($stockInWarehouse < $data['quantity']) {
                    throw new \Exception("Insufficient stock in warehouse for {$item->name}. Available: {$stockInWarehouse}, Requested: {$data['quantity']}");
                }
            }

            // Valuation Logic (Moving Average)
            $unitCost = $data['unit_cost'] ?? 0;
            if ($data['type'] === 'in') {
                $this->updateMovingAverage($item->id, $warehouseId, $data['quantity'], $unitCost);
            } else {
                // For OUT, use current average cost
                $pivot = DB::table('inventory_warehouse_stocks')
                    ->where('inventory_item_id', $item->id)
                    ->where('warehouse_id', $warehouseId)
                    ->first();
                $unitCost = $pivot ? (float) $pivot->avg_unit_cost : 0;
            }

            $movement = StockMovement::create(array_merge($data, [
                'warehouse_id' => $warehouseId,
                'unit_cost'    => $unitCost,
                'total_cost'   => $unitCost * $data['quantity'],
                'user_id'      => auth()->id()
            ]));

            // Update physical stock pivot
            $this->updatePhysicalStock($item->id, $warehouseId, $data['type'], $data['quantity']);

            if ($movement->type === 'out') {
                event(new \App\Events\StockConsumed($movement));
            }

            if ($movement->type === 'in' && $movement->reference_type === 'purchase') {
                event(new \App\Events\StockPurchased($movement));
            }

            return $movement;
        });
    }

    /**
     * Transfer stock between warehouses.
     */
    public function transfer(int $itemId, int $fromWarehouseId, int $toWarehouseId, float $quantity): void
    {
        DB::transaction(function () use ($itemId, $fromWarehouseId, $toWarehouseId, $quantity) {
            // 1. Check source stock
            $item = InventoryItem::findOrFail($itemId);
            if ($item->stockInWarehouse($fromWarehouseId) < $quantity) {
                throw new \Exception("Insufficient stock in source warehouse.");
            }

            // 2. Record OUT from source
            $this->recordMovement([
                'inventory_item_id' => $itemId,
                'warehouse_id'      => $fromWarehouseId,
                'type'              => 'out',
                'quantity'          => $quantity,
                'reference_type'    => 'transfer_out',
                'notes'             => "To Warehouse ID: {$toWarehouseId}"
            ]);

            // 3. Record IN to destination
            $pivot = DB::table('inventory_warehouse_stocks')
                ->where('inventory_item_id', $itemId)
                ->where('warehouse_id', $fromWarehouseId)
                ->first();
                
            $this->recordMovement([
                'inventory_item_id' => $itemId,
                'warehouse_id'      => $toWarehouseId,
                'type'              => 'in',
                'quantity'          => $quantity,
                'unit_cost'         => $pivot->avg_unit_cost ?? 0,
                'reference_type'    => 'transfer_in',
                'notes'             => "From Warehouse ID: {$fromWarehouseId}"
            ]);
        });
    }

    /**
     * Receive goods from a Purchase Order (GRN).
     */
    public function receivePO(int $poId, array $receivedItems, int $warehouseId): void
    {
        DB::transaction(function () use ($poId, $receivedItems, $warehouseId) {
            $po = PurchaseOrder::with('items')->findOrFail($poId);
            
            foreach ($receivedItems as $received) {
                $poItem = $po->items()->where('inventory_item_id', $received['id'])->first();
                if (!$poItem) continue;

                $this->recordMovement([
                    'inventory_item_id' => $received['id'],
                    'warehouse_id'      => $warehouseId,
                    'type'              => 'in',
                    'quantity'          => $received['quantity'],
                    'unit_cost'         => $poItem->unit_price,
                    'reference_type'    => 'purchase',
                    'reference_id'      => $po->id,
                    'notes'             => "GRN for PO #{$po->po_no}"
                ]);

                $poItem->increment('received_quantity', $received['quantity']);
            }

            // Update PO Status
            $po->load('items');
            $allReceived = $po->items->every(fn($i) => $i->received_quantity >= $i->quantity);
            $po->update(['status' => $allReceived ? 'received' : 'partially_received']);
        });
    }

    /**
     * Update Weighted Moving Average Cost.
     */
    private function updateMovingAverage(int $itemId, int $warehouseId, float $newQty, float $newCost): void
    {
        $pivot = DB::table('inventory_warehouse_stocks')
            ->where('inventory_item_id', $itemId)
            ->where('warehouse_id', $warehouseId)
            ->first();

        if ($pivot) {
            $currentQty = (float) $pivot->quantity;
            $currentAvg = (float) $pivot->avg_unit_cost;
            
            if ($currentQty + $newQty > 0) {
                $newAvg = (($currentQty * $currentAvg) + ($newQty * $newCost)) / ($currentQty + $newQty);
                DB::table('inventory_warehouse_stocks')
                    ->where('id', $pivot->id)
                    ->update(['avg_unit_cost' => $newAvg]);
            }
        }
    }

    /**
     * Update physical stock quantity in pivot table.
     */
    private function updatePhysicalStock(int $itemId, int $warehouseId, string $type, float $qty): void
    {
        $existing = DB::table('inventory_warehouse_stocks')
            ->where('inventory_item_id', $itemId)
            ->where('warehouse_id', $warehouseId)
            ->first();

        if ($existing) {
            $modifier = $type === 'in' ? $qty : -$qty;
            DB::table('inventory_warehouse_stocks')
                ->where('id', $existing->id)
                ->update(['quantity' => $existing->quantity + $modifier]);
        } else if ($type === 'in') {
            DB::table('inventory_warehouse_stocks')->insert([
                'inventory_item_id' => $itemId,
                'warehouse_id'      => $warehouseId,
                'quantity'          => $qty,
                'avg_unit_cost'     => 0, // Will be updated by updateMovingAverage if cost provided
                'created_at'        => now(),
                'updated_at'        => now()
            ]);
        }
    }

    /**
     * Get real-time stock levels across warehouses.
     */
    public function getStockStatus()
    {
        return InventoryItem::with(['category', 'warehouses'])
            ->where('is_active', true)
            ->get()
            ->map(function ($item) {
                $totalStock = $item->totalStock();
                
                // Valuation
                $totalValue = $item->warehouses->sum(function($w) {
                    return $w->pivot->quantity * $w->pivot->avg_unit_cost;
                });

                return [
                    'id'    => $item->id,
                    'sku'   => $item->sku,
                    'name'  => $item->name,
                    'brand' => $item->brand,
                    'category' => $item->category->name,
                    'current_stock' => $totalStock,
                    'total_value'   => $totalValue,
                    'avg_cost'      => $totalStock > 0 ? $totalValue / $totalStock : 0,
                    'is_low' => $item->min_stock_level > 0 && $totalStock <= $item->min_stock_level,
                    'warehouse_breakdown' => $item->warehouses->map(fn($w) => [
                        'name' => $w->name,
                        'qty'  => $w->pivot->quantity
                    ])
                ];
            });
    }
}
