<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\TaskDependency;

class TaskDependencyController extends Controller
{
    public function store(Request $request, $taskId)
    {
        $validated = $request->validate([
            'depends_on_task_id' => 'required|exists:project_tasks,id|different:task_id',
            'dependency_type'    => 'nullable|in:FS,SS',
        ]);

        $validated['task_id'] = $taskId;
        $dep = TaskDependency::firstOrCreate($validated);

        return response()->json($dep, 201);
    }

    public function destroy($taskId, $depId)
    {
        TaskDependency::where('task_id', $taskId)->findOrFail($depId)->delete();
        return response()->json(null, 204);
    }
}
