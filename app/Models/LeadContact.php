<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeadContact extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'name', 'role', 'phone', 'email', 'is_primary'];

    protected $casts = [
        'is_primary' => 'boolean'
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
