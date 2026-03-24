<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\Timesheet;
use App\Models\Payroll;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class HRService
{
    public function __construct(private AccountingService $accountingService) {}

    /**
     * Record employee attendance.
     */
    public function recordAttendance(int $employeeId, array $data): Attendance
    {
        return Attendance::updateOrCreate(
            ['employee_id' => $employeeId, 'date' => $data['date']],
            $data
        );
    }

    /**
     * Log working hours on a project task.
     */
    public function logTime(int $employeeId, array $data): Timesheet
    {
        return Timesheet::create(array_merge($data, [
            'employee_id' => $employeeId
        ]));
    }

    /**
     * Generate payroll for an employee for a specific month/year.
     */
    public function generatePayroll(int $employeeId, int $month, int $year): Payroll
    {
        return DB::transaction(function () use ($employeeId, $month, $year) {
            $employee = Employee::findOrFail($employeeId);
            
            // 1. Calculate Overtime from Timesheets
            // Assuming standard 180 hours/month, anything above is overtime
            $totalHours = Timesheet::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->sum('hours');
            
            $standardHours = 180;
            $overtimeHours = max(0, $totalHours - $standardHours);
            $hourlyRate = (float) $employee->salary / $standardHours;
            $overtimePay = $overtimeHours * $hourlyRate * 1.5; // 1.5x for overtime

            // 2. Calculate Deductions from Attendance
            $absentDays = Attendance::where('employee_id', $employeeId)
                ->whereMonth('date', $month)
                ->whereYear('date', $year)
                ->where('status', 'absent')
                ->count();
            
            $perDayDeduction = (float) $employee->salary / 22; // Assuming 22 working days
            $deductions = $absentDays * $perDayDeduction;
            
            $baseSalary = (float) $employee->salary;
            $bonus = 0; 
            
            $netSalary = $baseSalary + $bonus + $overtimePay - $deductions;

            $payroll = Payroll::updateOrCreate(
                ['employee_id' => $employeeId, 'month' => $month, 'year' => $year],
                [
                    'base_salary'  => $baseSalary,
                    'bonus'        => $bonus,
                    'deductions'   => $deductions,
                    'overtime_pay' => $overtimePay,
                    'net_salary'   => $netSalary,
                    'status'       => 'processed'
                ]
            );

            // Accounting Integration
            $this->journalizeSalary($payroll);

            return $payroll;
        });
    }

    /**
     * Create accounting journal for salary expense.
     */
    private function journalizeSalary(Payroll $payroll): void
    {
        $salaryExpense = Account::where('code', '5210')->firstOrFail(); // Salaries & Wages
        $payable       = Account::where('code', '2110')->firstOrFail(); // Accounts Payable (or a specific Salary Payable)

        $journal = $this->accountingService->post([
            'date'        => now()->toDateString(),
            'description' => "Salary processed for {$payroll->employee->full_name} ({$payroll->month}/{$payroll->year})",
            'source'      => 'payroll',
            'source_id'   => $payroll->id,
        ], [
            [
                'account_id' => $salaryExpense->id,
                'type'       => 'debit',
                'amount'     => $payroll->net_salary,
                'narration'  => "Monthly salary expense",
            ],
            [
                'account_id' => $payable->id,
                'type'       => 'credit',
                'amount'     => $payroll->net_salary,
                'narration'  => "Salary payable to employee",
            ],
        ]);

        $payroll->update(['journal_id' => $journal->id]);
    }
}
