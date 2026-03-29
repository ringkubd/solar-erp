<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MoneyReceipt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'receipt_no', 'client_id', 'invoice_id', 'recorded_by',
        'amount', 'discount_amount', 'payment_method', 'transaction_ref', 'receipt_date', 'notes',
    ];

    protected $casts = [
        'receipt_date'    => 'date',
        'amount'          => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    // ---- Relationships ----

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    // ---- Auto Receipt Number ----
    protected static function booted(): void
    {
        static::creating(function (MoneyReceipt $receipt) {
            if (empty($receipt->receipt_no)) {
                $year  = now()->year;
                $count = MoneyReceipt::whereYear('created_at', $year)->withTrashed()->count() + 1;
                $receipt->receipt_no = sprintf('RCP-%d-%04d', $year, $count);
            }
        });
    }
}
