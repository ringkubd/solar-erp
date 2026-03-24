<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectPhase;
use App\Models\ProjectTask;
use App\Models\Project;

class ProjectPhaseController extends Controller
{
    public function index($projectId)
    {
        $phases = ProjectPhase::where('project_id', $projectId)
            ->with(['tasks.assignee', 'tasks.phase'])
            ->orderBy('start_date')
            ->get();

        return response()->json($phases);
    }

    public function store(Request $request, $projectId)
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:200',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'status'     => 'nullable|in:pending,running,completed,delayed',
        ]);

        $validated['project_id'] = $projectId;
        $validated['status'] = $validated['status'] ?? 'pending';

        $phase = ProjectPhase::create($validated);

        return response()->json($phase, 201);
    }

    public function update(Request $request, $projectId, $phaseId)
    {
        $phase = ProjectPhase::where('project_id', $projectId)->findOrFail($phaseId);
        $phase->update($request->all());

        // Auto-rollup: recalculate phase progress from tasks
        $tasks = ProjectTask::where('phase_id', $phaseId)->get();
        if ($tasks->count() > 0) {
            $totalHours = $tasks->sum('estimated_hours') ?: $tasks->count();
            $weighted = $tasks->sum(fn($t) => $t->progress_pct * ($t->estimated_hours ?: 1));
            $phase->progress_pct = round($weighted / $totalHours);
            $phase->save();
        }

        // Rollup to project
        $this->recalcProjectProgress($projectId);

        return response()->json($phase);
    }

    public function destroy($projectId, $phaseId)
    {
        ProjectPhase::where('project_id', $projectId)->findOrFail($phaseId)->delete();
        return response()->json(null, 204);
    }

    private function recalcProjectProgress($projectId)
    {
        $phases = ProjectPhase::where('project_id', $projectId)->get();
        if ($phases->count() > 0) {
            $avg = round($phases->avg('progress_pct'));
            Project::where('id', $projectId)->update(['progress' => $avg]);
        }
    }
}
