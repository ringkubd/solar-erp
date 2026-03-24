<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PurchaseOrder;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function __construct(private InventoryService $inventoryService) {}

    public function index()
    {
        return response()->json(PurchaseOrder::with(['vendor', 'creator'])->orderByDesc('created_at')->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vendor_id'   => 'required|exists:vendors,id',
            'order_date'  => 'required|date',
            'expected_date' => 'nullable|date',
            'notes'       => 'nullable|string',
            'items'       => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity'   => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        try {
            return DB::transaction(function () use ($validated) {
                $poNo = 'PO-' . now()->format('Ymd') . '-' . rand(1000, 9999);
                
                $po = PurchaseOrder::create([
                    'po_no'       => $poNo,
                    'vendor_id'   => $validated['vendor_id'],
                    'order_date'  => $validated['order_date'],
                    'expected_date' => $validated['expected_date'] ?? null,
                    'notes'       => $validated['notes'] ?? null,
                    'created_by'  => auth()->id(),
                    'status'      => 'draft',
                ]);

                $totalAmount = 0;
                foreach ($validated['items'] as $item) {
                    $inventoryItem = \App\Models\InventoryItem::findOrFail($item['inventory_item_id']);
                    $this->inventoryService->validateQuantity($inventoryItem, $item['quantity']);

                    $lineTotal = $item['quantity'] * $item['unit_price'];
                    $po->items()->create(array_merge($item, [
                        'total_price' => $lineTotal
                    ]));
                    $totalAmount += $lineTotal;
                }

                $po->update(['total_amount' => $totalAmount]);

                return response()->json($po->load('items.inventoryItem', 'vendor'), 201);
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function show($id)
    {
        return response()->json(PurchaseOrder::with(['vendor', 'items.inventoryItem', 'creator'])->findOrFail($id));
    }

    /**
     * Receive goods from PO (GRN).
     */
    public function receive(Request $request, $id)
    {
        $validated = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'items'        => 'required|array|min:1',
            'items.*.id'   => 'required|exists:inventory_items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        try {
            $this->inventoryService->receivePO($id, $validated['items'], $validated['warehouse_id']);
            return response()->json(['message' => 'Goods received successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
