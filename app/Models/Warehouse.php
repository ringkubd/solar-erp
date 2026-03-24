<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Warehouse extends Model
{
    protected $fillable = ['name', 'code', 'location', 'is_active'];

    public function inventoryItems(): BelongsToMany
    {
        return $this->belongsToMany(InventoryItem::class, 'inventory_warehouse_stocks')
                    ->withPivot(['quantity', 'avg_unit_cost'])
                    ->withTimestamps();
    }
}
