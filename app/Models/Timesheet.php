<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Timesheet extends Model
{
    protected $fillable = ['employee_id', 'project_task_id', 'date', 'hours', 'description'];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'project_task_id');
    }
}
