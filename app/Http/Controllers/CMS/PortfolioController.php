<?php

namespace App\Http\Controllers\CMS;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index()
    {
        return response()->json(PortfolioProject::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'client_name' => 'nullable|string',
            'project_type' => 'required|string',
            'location' => 'nullable|string',
            'completion_date' => 'nullable|date',
            'capacity' => 'nullable|string',
            'challenge_description' => 'nullable|string',
            'solution_description' => 'nullable|string',
            'gallery_images' => 'nullable|array'
        ]);

        return response()->json(PortfolioProject::create($validated), 201);
    }

    public function show($id)
    {
        return response()->json(PortfolioProject::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $project = PortfolioProject::findOrFail($id);
        $project->update($request->all());
        return response()->json($project);
    }

    public function destroy($id)
    {
        PortfolioProject::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
