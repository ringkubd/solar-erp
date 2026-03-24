<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['product_category_id', 'title', 'slug', 'category', 'description', 'icon', 'specs', 'is_active'];

    protected function casts(): array
    {
        return [
            'specs' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function productCategory()
    {
        return $this->belongsTo(ProductCategory::class);
    }
    
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
