<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
        'inventory_category_id', 'name', 'sku', 'unit', 
        'min_stock_level', 'reorder_level', 'description', 
        'brand', 'model', 'specs', 'weight_kg', 'is_active'
    ];

    protected $casts = [
        'specs' => 'array',
        'is_active' => 'boolean'
    ];

    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    public function warehouses(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(Warehouse::class, 'inventory_warehouse_stocks')
                    ->withPivot(['quantity', 'avg_unit_cost'])
                    ->withTimestamps();
    }

    public function movements(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Get total stock across all warehouses.
     */
    public function totalStock(): float
    {
        return (float) $this->warehouses()->sum('inventory_warehouse_stocks.quantity');
    }

    /**
     * Get stock for a specific warehouse.
     */
    public function stockInWarehouse(int $warehouseId): float
    {
        return (float) $this->warehouses()
            ->where('warehouse_id', $warehouseId)
            ->first()
            ?->pivot->quantity ?? 0;
    }
}
