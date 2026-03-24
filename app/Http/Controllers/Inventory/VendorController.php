<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vendor;

class VendorController extends Controller
{
    public function index()
    {
        return response()->json(Vendor::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'contact_person' => 'nullable|string',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'bin_no' => 'nullable|string',
        ]);

        return response()->json(Vendor::create($validated), 201);
    }

    public function show(Vendor $vendor)
    {
        return response()->json($vendor->load('purchaseOrders'));
    }
}
