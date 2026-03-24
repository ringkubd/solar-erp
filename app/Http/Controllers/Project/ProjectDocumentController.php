<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectDocument;

class ProjectDocumentController extends Controller
{
    public function index($projectId)
    {
        return response()->json(ProjectDocument::where('project_id', $projectId)->orderByDesc('created_at')->get());
    }

    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'file_url'      => 'required|string',
            'document_type' => 'required|in:drawing,boq,contract,site_report,permit',
            'phase_id'      => 'nullable|exists:project_phases,id',
            'task_id'       => 'nullable|exists:project_tasks,id',
        ]);

        $validated['project_id'] = $projectId;
        $doc = ProjectDocument::create($validated);
        return response()->json($doc, 201);
    }

    public function destroy($projectId, $docId)
    {
        ProjectDocument::where('project_id', $projectId)->findOrFail($docId)->delete();
        return response()->json(null, 204);
    }
}
