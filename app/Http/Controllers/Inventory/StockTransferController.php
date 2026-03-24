<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StockTransfer;
use App\Services\InventoryService;
use Illuminate\Support\Facades\DB;

class StockTransferController extends Controller
{
    public function __construct(private InventoryService $inventoryService) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id|different:to_warehouse_id',
            'to_warehouse_id'   => 'required|exists:warehouses,id',
            'transfer_date'     => 'required|date',
            'items'             => 'required|array|min:1',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.quantity'   => 'required|numeric|min:0.01',
        ]);

        return DB::transaction(function () use ($validated) {
            $transferNo = 'TR-' . now()->format('Ymd') . '-' . rand(100, 999);
            
            $transfer = StockTransfer::create([
                'transfer_no'       => $transferNo,
                'from_warehouse_id' => $validated['from_warehouse_id'],
                'to_warehouse_id'   => $validated['to_warehouse_id'],
                'transfer_date'     => $validated['transfer_date'],
                'created_by'        => auth()->id(),
                'status'            => 'completed', // For now, direct completion
            ]);

            foreach ($validated['items'] as $item) {
                $transfer->items()->create($item);
                
                // Execute physical transfer logic in Service
                $this->inventoryService->transfer(
                    $item['inventory_item_id'], 
                    $validated['from_warehouse_id'], 
                    $validated['to_warehouse_id'], 
                    $item['quantity']
                );
            }

            return response()->json($transfer->load('items', 'fromWarehouse', 'toWarehouse'), 201);
        });
    }

    public function index()
    {
        return response()->json(StockTransfer::with(['fromWarehouse', 'toWarehouse'])->orderByDesc('created_at')->paginate(20));
    }
}
