<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectTask;
use App\Models\ProjectPhase;
use App\Models\Project;

class ProjectTaskController extends Controller
{
    public function store(Request $request, $projectId)
    {
        if ($request->has('phase_id') && $request->input('phase_id') === '') {
            $request->merge(['phase_id' => null]);
        }
        
        $validated = $request->validate([
            'title'            => 'required|string|max:200',
            'status'           => 'required|string',
            'phase_id'         => 'nullable|exists:project_phases,id',
            'assigned_to'      => 'nullable|exists:users,id',
            'priority'         => 'nullable|in:low,medium,high',
            'start_date'       => 'nullable|date',
            'due_date'         => 'nullable|date',
            'estimated_hours'  => 'nullable|numeric',
        ]);
        $validated['project_id'] = $projectId;
        $task = ProjectTask::create($validated);
        return response()->json($task->load('assignee'), 201);
    }

    public function update(Request $request, $projectId, $taskId)
    {
        if ($request->has('phase_id') && $request->input('phase_id') === '') {
            $request->merge(['phase_id' => null]);
        }
        
        $task = ProjectTask::where('project_id', $projectId)->findOrFail($taskId);
        $task->update($request->all());
        return response()->json($task->load('assignee'));
    }

    public function updateProgress(Request $request, $taskId)
    {
        $validated = $request->validate([
            'progress_pct'   => 'required|integer|min:0|max:100',
            'actual_hours'   => 'nullable|numeric',
            'status'         => 'nullable|string',
        ]);

        $task = ProjectTask::findOrFail($taskId);
        
        // Auto-update status to completed if 100%
        if ($validated['progress_pct'] == 100 && !isset($validated['status'])) {
            $validated['status'] = 'completed';
        }

        $task->update($validated);

        // Rollup phase progress
        if ($task->phase_id) {
            $phase = ProjectPhase::find($task->phase_id);
            $tasks = ProjectTask::where('phase_id', $task->phase_id)->get();
            $totalHours = $tasks->sum('estimated_hours') ?: $tasks->count();
            if ($totalHours > 0) {
                $weighted = $tasks->sum(fn($t) => $t->progress_pct * ($t->estimated_hours ?: 1));
                $phase->progress_pct = round($weighted / $totalHours);
                
                // Auto-complete phase if all tasks done
                if ($phase->progress_pct == 100) {
                    $phase->status = 'completed';
                }
                $phase->save();
            }

            // Rollup project
            $phases = ProjectPhase::where('project_id', $task->project_id)->get();
            if ($phases->count() > 0) {
                Project::where('id', $task->project_id)->update(['progress' => round($phases->avg('progress_pct'))]);
            }
        }

        return response()->json($task);
    }

    public function destroy($projectId, $taskId)
    {
        ProjectTask::where('project_id', $projectId)->findOrFail($taskId)->delete();
        return response()->json(null, 204);
    }
}
