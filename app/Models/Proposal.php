<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proposal extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'valid_until' => 'date',
        'sent_at' => 'datetime',
        'viewed_at' => 'datetime',
        'responded_at' => 'datetime',
        'approved_at' => 'datetime',
        'ai_generated' => 'boolean',
    ];

    public function lead() {
        return $this->belongsTo(Lead::class);
    }

    public function client() {
        return $this->belongsTo(Client::class);
    }

    public function parent() {
        return $this->belongsTo(Proposal::class, 'parent_id');
    }

    public function versions() {
        return $this->hasMany(Proposal::class, 'parent_id');
    }

    public function specs() {
        return $this->hasOne(ProposalSolarSpec::class);
    }

    public function sections() {
        return $this->hasMany(ProposalSection::class);
    }
}
