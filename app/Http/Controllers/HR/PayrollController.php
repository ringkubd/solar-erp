<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payroll;
use App\Services\HRService;

class PayrollController extends Controller
{
    public function __construct(private HRService $svc) {}

    // POST /payroll
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month'       => 'required|integer|between:1,12',
            'year'        => 'required|integer|min:2024',
        ]);

        try {
            $payroll = $this->svc->generatePayroll($validated['employee_id'], $validated['month'], $validated['year']);
            return response()->json($payroll, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // GET /hr/employees/{id}/payrolls
    public function index($id)
    {
        return response()->json(Payroll::where('employee_id', $id)->orderByDesc('year')->orderByDesc('month')->get());
    }
}
