<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'issue_date'   => 'date',
        'due_date'     => 'date',
        'sent_at'      => 'datetime',
        'subtotal'     => 'decimal:2',
        'vat_amount'   => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'amount_paid'  => 'decimal:2',
        'balance_due'  => 'decimal:2',
    ];

    // ---- Relationships ----

    public function items()
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments()
    {
        return $this->hasMany(InvoicePayment::class)->orderBy('payment_date');
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone()
    {
        return $this->belongsTo(ProjectPhase::class, 'milestone_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ---- Computed Helpers ----

    /**
     * Recalculate totals from items. Call before saving when items change.
     */
    public function recalculateTotals(): void
    {
        $subtotal = $this->items->sum(fn($item) => $item->qty * $item->unit_price * (1 - $item->discount_pct / 100));
        $vatAmount = $this->items->sum('vat_amount');
        $total = $subtotal + $vatAmount - ($this->discount_amount ?? 0);

        $this->subtotal    = $subtotal;
        $this->vat_amount  = $vatAmount;
        $this->total_amount = max(0, $total);
        $this->balance_due = max(0, $this->total_amount - ($this->amount_paid ?? 0));
    }

    /**
     * Check and update overdue status.
     */
    public function checkOverdue(): void
    {
        if (!in_array($this->status, ['paid', 'cancelled']) && $this->due_date < now()) {
            $this->updateQuietly(['status' => 'overdue']);
        }
    }

    // ---- Auto-increment Invoice No ----
    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_no)) {
                $year = now()->year;
                $count = Invoice::whereYear('created_at', $year)->withTrashed()->count() + 1;
                $invoice->invoice_no = sprintf('INV-%d-%04d', $year, $count);
            }
        });
    }
}
