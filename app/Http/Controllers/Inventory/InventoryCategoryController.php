<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InventoryCategory;

class InventoryCategoryController extends Controller
{
    public function index()
    {
        return response()->json(InventoryCategory::all());
    }

    public function show($id)
    {
        return response()->json(InventoryCategory::findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        return response()->json(InventoryCategory::create($validated), 201);
    }

    public function update(Request $request, $id)
    {
        $category = InventoryCategory::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = InventoryCategory::findOrFail($id);
        
        // Check if there are items in this category
        if ($category->items()->exists()) {
            return response()->json(['message' => 'Category cannot be deleted because it has items.'], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted.'], 200);
    }
}
