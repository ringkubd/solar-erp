<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectTask;
use App\Models\Attendance;
use App\Models\Timesheet;

class EmployeePortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $employee = $request->user();
        
        $projects = $employee->projects()->with(['phases', 'tasks'])->get();
        
        $pendingTasks = ProjectTask::whereIn('project_id', $projects->pluck('id'))
            ->where('status', '!=', 'completed')
            ->count();

        $monthAttendance = Attendance::where('employee_id', $employee->id)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->count();

        return response()->json([
            'profile' => $employee,
            'projects_count' => $projects->count(),
            'pending_tasks' => $pendingTasks,
            'month_attendance' => $monthAttendance,
            'assigned_projects' => $projects
        ]);
    }

    public function myTasks(Request $request)
    {
        $employee = $request->user();
        // Since tasks aren't directly linked to employees in current schema, 
        // we'll assume tasks in assigned projects are for the team. 
        // In a real system, tasks would have an assigned_to_id.
        
        $tasks = ProjectTask::whereIn('project_id', $employee->projects()->pluck('projects.id'))
            ->with('project')
            ->orderBy('due_date')
            ->get();
            
        return response()->json($tasks);
    }

    public function myAttendance(Request $request)
    {
        $employee = $request->user();
        return response()->json(
            Attendance::where('employee_id', $employee->id)
                ->orderByDesc('date')
                ->paginate(30)
        );
    }

    public function myTimesheets(Request $request)
    {
        $employee = $request->user();
        return response()->json(
            Timesheet::where('employee_id', $employee->id)
                ->with('projectTask.project')
                ->orderByDesc('date')
                ->paginate(30)
        );
    }
}
