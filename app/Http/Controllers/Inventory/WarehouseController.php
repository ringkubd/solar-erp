<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warehouse;

class WarehouseController extends Controller
{
    public function index()
    {
        return response()->json(Warehouse::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:warehouses,code',
            'location' => 'nullable|string',
        ]);

        return response()->json(Warehouse::create($validated), 201);
    }

    public function show(Warehouse $warehouse)
    {
        return response()->json($warehouse->load('inventoryItems'));
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $warehouse->update($validated);
        return response()->json($warehouse);
    }
}
