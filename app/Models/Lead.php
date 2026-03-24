<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'source', 'full_name', 'company_name', 'email', 'phone', 'address', 
        'district', 'project_type', 'load_kw', 'budget_bdt', 'stage', 
        'lead_score', 'next_follow_up_date', 'assigned_to', 'expected_close', 
        'lost_reason', 'notes'
    ];

    protected $casts = [
        'next_follow_up_date' => 'datetime',
        'expected_close' => 'date',
    ];

    public function assignedUser() {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities() {
        return $this->hasMany(LeadActivity::class)->orderBy('created_at', 'desc');
    }

    public function contacts() {
        return $this->hasMany(LeadContact::class);
    }

    public function surveys() {
        return $this->hasMany(SiteSurvey::class);
    }
}
