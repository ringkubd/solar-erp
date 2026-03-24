<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::orderBy('order_num')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'description' => 'required|string',
            'color' => 'nullable|string',
            'order_num' => 'integer'
        ]);

        return response()->json(Brand::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(Brand::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::findOrFail($id);
        $brand->update($request->all());
        return response()->json($brand);
    }

    public function destroy($id)
    {
        Brand::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
