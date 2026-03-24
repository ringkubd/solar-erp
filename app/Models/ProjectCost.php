<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectCost extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'logged_at' => 'datetime',
        'estimated_amount' => 'decimal:2',
        'actual_amount' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function task()
    {
        return $this->belongsTo(ProjectTask::class, 'task_id');
    }
}
