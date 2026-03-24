<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ProductCategory extends Model
{
    protected $fillable = ['name', 'slug', 'icon', 'description', 'is_active', 'order_num'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($cat) {
            if (empty($cat->slug)) {
                $cat->slug = Str::slug($cat->name);
            }
        });
    }
}
