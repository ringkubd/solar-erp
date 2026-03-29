<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Client;

class ClientController extends Controller
{
    public function index()
    {
        return response()->json(Client::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:200',
            'email' => 'required|email|unique:clients,email',
            'password' => 'required|string|min:6',
            'trade_license' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string',
            'site_address' => 'nullable|string',
            'district' => 'nullable|string|max:100',
            'lead_id' => 'nullable|exists:leads,id',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $client = Client::create($validated);
        return response()->json($client, 201);
    }

    public function show($id)
    {
        return response()->json(Client::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:200',
            'email' => "sometimes|required|email|unique:clients,email,{$id}",
            'password' => 'nullable|string|min:6',
            'trade_license' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string',
            'site_address' => 'nullable|string',
            'district' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $client->update($validated);
        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(null, 204);
    }
}
