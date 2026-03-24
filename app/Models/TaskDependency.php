<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskDependency extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'task_id');
    }

    public function dependsOnTask()
    {
        return $this->belongsTo(ProjectTask::class, 'depends_on_task_id');
    }
}
