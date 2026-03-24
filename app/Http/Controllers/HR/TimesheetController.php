<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Timesheet;
use App\Services\HRService;

class TimesheetController extends Controller
{
    public function __construct(private HRService $svc) {}

    // POST /timesheet
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id'     => 'required|exists:employees,id',
            'project_task_id' => 'required|exists:project_tasks,id',
            'date'            => 'required|date',
            'hours'           => 'required|numeric|min:0.5|max:24',
            'description'     => 'nullable|string',
        ]);

        return response()->json($this->svc->logTime($validated['employee_id'], $validated), 201);
    }

    // GET /hr/employees/{id}/timesheets
    public function index($id)
    {
        return response()->json(Timesheet::with('task')->where('employee_id', $id)->orderByDesc('date')->paginate(30));
    }
}
