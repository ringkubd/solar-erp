<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PortfolioProject extends Model
{
    protected $fillable = ['title', 'slug', 'client_name', 'project_type', 'location', 'completion_date', 'capacity', 'challenge_description', 'solution_description', 'gallery_images'];
    
    protected $casts = [
        'gallery_images' => 'array',
        'completion_date' => 'date'
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($port) {
            if (empty($port->slug)) {
                $port->slug = Str::slug($port->title);
            }
        });
    }
}
