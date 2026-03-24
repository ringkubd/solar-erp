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
            'trade_license' => 'nullable|string|max:100',
            'tax_id' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string',
            'site_address' => 'nullable|string',
            'district' => 'nullable|string|max:100',
            'lead_id' => 'nullable|exists:leads,id',
        ]);

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
        $client->update($request->all());
        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        $client->delete();
        return response()->json(null, 204);
    }
}
