<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'description' => 'required|string',
            'icon' => 'nullable|string',
            'specs' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        return response()->json(Product::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(Product::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
