<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $fillable = [
        'employee_id', 'month', 'year', 'base_salary', 'bonus', 
        'deductions', 'overtime_pay', 'net_salary', 'status', 'journal_id'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }
}
