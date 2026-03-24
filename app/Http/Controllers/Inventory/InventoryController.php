<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\StockMovement;
use App\Services\InventoryService;

class InventoryController extends Controller
{
    public function __construct(private InventoryService $svc) {}

    // GET /inventory/items
    public function index()
    {
        return response()->json($this->svc->getStockStatus());
    }

    // GET /inventory/items/{id}
    public function show($id)
    {
        $item = InventoryItem::with(['category', 'warehouses'])->findOrFail($id);
        
        $totalStock = $item->totalStock();
        $totalValue = $item->warehouses->sum(function($w) {
            return $w->pivot->quantity * $w->pivot->avg_unit_cost;
        });

        return response()->json(array_merge($item->toArray(), [
            'current_stock' => $totalStock,
            'total_value'   => $totalValue,
            'avg_cost'      => $totalStock > 0 ? $totalValue / $totalStock : 0,
            'warehouse_breakdown' => $item->warehouses->map(fn($w) => [
                'id'   => $w->id,
                'name' => $w->name,
                'qty'  => $w->pivot->quantity,
                'avg_cost' => $w->pivot->avg_unit_cost
            ])
        ]));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'inventory_category_id' => 'required|exists:inventory_categories,id',
            'name'            => 'required|string|max:255',
            'sku'             => 'required|string|unique:inventory_items,sku',
            'unit'            => 'required|string',
            'brand'           => 'nullable|string',
            'model'           => 'nullable|string',
            'min_stock_level' => 'nullable|numeric|min:0',
            'reorder_level'   => 'nullable|numeric|min:0',
            'weight_kg'       => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
            'specs'           => 'nullable|array',
        ]);

        return response()->json(InventoryItem::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);
        
        $validated = $request->validate([
            'inventory_category_id' => 'required|exists:inventory_categories,id',
            'name'            => 'required|string|max:255',
            'sku'             => 'required|string|unique:inventory_items,sku,'.$item->id,
            'unit'            => 'required|string',
            'brand'           => 'nullable|string',
            'model'           => 'nullable|string',
            'min_stock_level' => 'nullable|numeric|min:0',
            'reorder_level'   => 'nullable|numeric|min:0',
            'weight_kg'       => 'nullable|numeric|min:0',
            'description'     => 'nullable|string',
            'specs'           => 'nullable|array',
            'is_active'       => 'boolean'
        ]);

        $item->update($validated);
        return response()->json($item->load('category'));
    }

    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        
        // Check if there are movements or stock
        if ($item->movements()->exists() || $item->totalStock() > 0) {
            $item->update(['is_active' => false]);
            return response()->json(['message' => 'Item deactivated because it has stock or history.'], 200);
        }

        $item->delete();
        return response()->json(['message' => 'Item deleted.'], 200);
    }

    // POST /inventory/movements (Stock IN/OUT)
    public function move(Request $request)
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'warehouse_id'      => 'nullable|exists:warehouses,id',
            'type'              => 'required|in:in,out',
            'quantity'          => 'required|numeric|min:0.01',
            'unit_cost'         => 'nullable|numeric|min:0',
            'reference_type'    => 'nullable|string',
            'reference_id'      => 'nullable|integer',
            'notes'             => 'nullable|string',
        ]);

        try {
            $movement = $this->svc->recordMovement($validated);
            return response()->json($movement, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // GET /inventory/items/{id}/history
    public function history($id)
    {
        return response()->json(
            StockMovement::with('user')
                ->where('inventory_item_id', $id)
                ->orderByDesc('created_at')
                ->paginate(20)
        );
    }
}
