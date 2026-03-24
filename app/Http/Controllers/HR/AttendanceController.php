<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Services\HRService;

class AttendanceController extends Controller
{
    public function __construct(private HRService $svc) {}

    // POST /attendance
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i',
            'status'      => 'required|in:present,absent,on_leave,half_day',
            'notes'       => 'nullable|string',
        ]);

        return response()->json($this->svc->recordAttendance($validated['employee_id'], $validated), 201);
    }

    // GET /hr/employees/{id}/attendance
    public function index($id)
    {
        return response()->json(Attendance::where('employee_id', $id)->orderByDesc('date')->paginate(30));
    }
}
