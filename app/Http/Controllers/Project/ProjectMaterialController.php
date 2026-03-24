<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectMaterial;

class ProjectMaterialController extends Controller
{
    public function index($projectId)
    {
        return response()->json(ProjectMaterial::where('project_id', $projectId)->get());
    }

    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'item_name' => 'required|string|max:200',
            'quantity_required' => 'required|numeric|min:0',
        ]);
        
        $validated['project_id'] = $projectId;
        $validated['status'] = 'pending';
        
        $material = ProjectMaterial::create($validated);
        return response()->json($material, 201);
    }

    public function update(Request $request, $projectId, $id)
    {
        $material = ProjectMaterial::where('project_id', $projectId)->findOrFail($id);
        
        $validated = $request->validate([
            'quantity_used' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,procured,installed'
        ]);
        
        $material->update($validated);
        return response()->json($material);
    }

    public function destroy($projectId, $id)
    {
        ProjectMaterial::where('project_id', $projectId)->findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
