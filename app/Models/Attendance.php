<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['employee_id', 'date', 'check_in', 'check_out', 'status', 'notes'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
