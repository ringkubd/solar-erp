<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectTask extends Model
{
    protected $fillable = [
        'project_id', 'phase_id', 'title', 'description', 'status', 'priority', 
        'start_date', 'due_date', 'estimated_hours', 'actual_hours', 'progress_pct', 
        'assigned_to', 'parent_id', 'depends_on_task_id'
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
    ];

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function assignee() {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function parent() {
        return $this->belongsTo(ProjectTask::class, 'parent_id');
    }

    public function dependency() {
        return $this->belongsTo(ProjectTask::class, 'depends_on_task_id');
    }

    public function dependents() {
        return $this->hasMany(ProjectTask::class, 'depends_on_task_id');
    }

    public function phase() {
        return $this->belongsTo(ProjectPhase::class, 'phase_id');
    }

    public function costs() {
        return $this->hasMany(ProjectCost::class, 'task_id');
    }

    public function documents() {
        return $this->hasMany(ProjectDocument::class, 'task_id');
    }
}
