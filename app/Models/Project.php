<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $guarded = [];

    public function proposals() {
        return $this->belongsTo(Proposal::class, 'proposal_id');
    }

    public function tasks() {
        return $this->hasMany(ProjectTask::class);
    }

    public function expenses() {
        return $this->hasMany(ProjectExpense::class);
    }

    public function materials() {
        return $this->hasMany(ProjectMaterial::class);
    }

    public function documents() {
        return $this->hasMany(ProjectDocument::class);
    }

    public function siteSurveys() {
        return $this->hasMany(SiteSurvey::class);
    }

    public function client(){
        return $this->belongsTo(Client::class);
    }

    public function phases() {
        return $this->hasMany(ProjectPhase::class);
    }

    public function costs() {
        return $this->hasMany(ProjectCost::class);
    }
}
