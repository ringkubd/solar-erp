<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payroll;
use App\Services\HRService;
use App\Services\AccountingService;

class PayrollController extends Controller
{
    public function __construct(private HRService $svc, private AccountingService $accounting) {}

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

    // POST /payroll/bulk
    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'month' => 'required|integer|between:1,12',
            'year'  => 'required|integer|min:2024',
        ]);

        $result = $this->svc->bulkGeneratePayroll($validated['month'], $validated['year']);
        return response()->json($result);
    }

    // POST /payroll/{id}/pay
    public function pay($id)
    {
        try {
            $payroll = $this->svc->markPayrollAsPaid($id);
            return response()->json($payroll);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    // GET /payroll
    public function index(Request $request)
    {
        $query = Payroll::with('employee.department', 'employee.designation');

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->has('month')) {
            $query->where('month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        return response()->json($query->orderByDesc('year')->orderByDesc('month')->get());
    }
}
