<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return response()->json(Service::orderBy('order_num')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'icon' => 'nullable|string',
            'order_num' => 'integer'
        ]);

        return response()->json(Service::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(Service::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);
        $service->update($request->all());
        return response()->json($service);
    }

    public function destroy($id)
    {
        Service::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
