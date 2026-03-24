<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Lead;
use App\Models\Project;
use App\Models\User;

class SiteSurvey extends Model
{
    protected $fillable = [
        'lead_id', 'project_id', 'surveyor_id', 'scheduled_date', 
        'address', 'latitude', 'longitude', 'roof_details', 
        'electrical_details', 'notes'
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'roof_details' => 'array',
        'electrical_details' => 'array',
    ];

    public function lead() {
        return $this->belongsTo(Lead::class);
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function surveyor() {
        return $this->belongsTo(User::class, 'surveyor_id');
    }
}
