<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'item_name', 'quantity_required', 'quantity_used', 'status'
    ];

    protected $casts = [
        'quantity_required' => 'decimal:2',
        'quantity_used' => 'decimal:2',
    ];

    public function project() {
        return $this->belongsTo(Project::class);
    }
}
