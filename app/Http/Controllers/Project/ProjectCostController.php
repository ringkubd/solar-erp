<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectCost;
use App\Models\Project;

class ProjectCostController extends Controller
{
    public function index($projectId)
    {
        $costs = ProjectCost::where('project_id', $projectId)
            ->with('task')
            ->orderByDesc('logged_at')
            ->get();

        $summary = [
            'estimated_total' => $costs->sum('estimated_amount'),
            'actual_total'    => $costs->sum('actual_amount'),
            'variance'        => $costs->sum('estimated_amount') - $costs->sum('actual_amount'),
            'breakdown'       => $costs->groupBy('type')->map(fn($g) => [
                'estimated' => $g->sum('estimated_amount'),
                'actual'    => $g->sum('actual_amount'),
            ]),
        ];

        return response()->json(['summary' => $summary, 'items' => $costs]);
    }

    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'task_id'          => 'nullable|exists:project_tasks,id',
            'type'             => 'required|in:material,labor,subcontractor,logistics,other',
            'description'      => 'nullable|string',
            'estimated_amount' => 'required|numeric|min:0',
            'actual_amount'    => 'nullable|numeric|min:0',
        ]);

        $validated['project_id'] = $projectId;

        $cost = ProjectCost::create($validated);

        return response()->json($cost, 201);
    }

    public function update(Request $request, $projectId, $costId)
    {
        $cost = ProjectCost::where('project_id', $projectId)->findOrFail($costId);
        $cost->update($request->all());

        return response()->json($cost);
    }

    public function destroy($projectId, $costId)
    {
        ProjectCost::where('project_id', $projectId)->findOrFail($costId)->delete();
        return response()->json(null, 204);
    }
}
