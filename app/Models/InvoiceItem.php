<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id', 'description', 'item_type', 'qty', 'unit_price',
        'unit', 'vat_pct', 'vat_amount', 'discount_pct', 'total_price', 'sort_order',
    ];

    protected $casts = [
        'qty'          => 'decimal:2',
        'unit_price'   => 'decimal:2',
        'vat_pct'      => 'decimal:2',
        'vat_amount'   => 'decimal:2',
        'discount_pct' => 'decimal:2',
        'total_price'  => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Calculate and set line totals before saving.
     */
    protected static function booted(): void
    {
        static::saving(function (InvoiceItem $item) {
            $lineSubtotal  = $item->qty * $item->unit_price * (1 - ($item->discount_pct ?? 0) / 100);
            $item->vat_amount  = round($lineSubtotal * ($item->vat_pct ?? 0) / 100, 2);
            $item->total_price = round($lineSubtotal + $item->vat_amount, 2);
        });
    }
}
