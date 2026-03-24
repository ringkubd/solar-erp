<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'detailed_content', 'icon', 'order_num'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($m) {
            if (empty($m->slug)) {
                $m->slug = \Illuminate\Support\Str::slug($m->title) . '-' . uniqid();
            }
        });
    }
}
