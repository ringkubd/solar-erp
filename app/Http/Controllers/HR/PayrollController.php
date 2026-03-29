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
            'base_salary' => 'required|numeric',
            'bonus'       => 'nullable|numeric',
            'deductions'  => 'nullable|numeric',
            'status'      => 'required|in:draft,processed,paid',
        ]);

        try {
            $payroll = $this->svc->generatePayroll($validated['employee_id'], $validated['month'], $validated['year']);
            $payroll->update([
                'base_salary' => $validated['base_salary'],
                'bonus'       => $validated['bonus'] ?? 0,
                'deductions'  => $validated['deductions'] ?? 0,
                'net_salary'  => $validated['base_salary'] + ($validated['bonus'] ?? 0) - ($validated['deductions'] ?? 0),
                'status'      => $validated['status'],
            ]);

            if ($payroll->status === 'paid') {
                $journal = $this->accounting->journalizePayroll($payroll);
                $payroll->update(['journal_id' => $journal->id]);
            }

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
