<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        'user_id', 'department_id', 'designation_id', 'employee_id', 
        'first_name', 'last_name', 'email', 'phone', 'role', 
        'salary', 'salary_structure', 'join_date', 'status', 'address', 'contract_file'
    ];

    protected $casts = [
        'salary_structure' => 'array',
        'join_date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function timesheets()
    {
        return $this->hasMany(Timesheet::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function documents()
    {
        return $this->hasMany(EmployeeDocument::class);
    }

    public function roles()
    {
        return $this->hasMany(EmployeeRole::class);
    }

    public function getFullNameAttribute()
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
