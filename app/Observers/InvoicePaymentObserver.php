<?php

namespace App\Observers;

use App\Models\InvoicePayment;
use App\Models\Invoice;

class InvoicePaymentObserver
{
    /**
     * After a payment is saved or deleted, recalculate the invoice totals.
     */
    private function recalculate(Invoice $invoice): void
    {
        $amountPaid = $invoice->payments()->sum('amount');
        $balanceDue = max(0, $invoice->total_amount - $amountPaid);
        
        $status = $invoice->status;
        if ($balanceDue <= 0) {
            $status = 'paid';
        } elseif ($amountPaid > 0 && $balanceDue > 0) {
            $status = 'partially_paid';
        } elseif ($amountPaid == 0 && $invoice->status === 'paid') {
            $status = 'sent'; // Payment reversed
        }

        $invoice->updateQuietly([
            'amount_paid' => $amountPaid,
            'balance_due' => $balanceDue,
            'status'      => $status,
        ]);
    }

    public function created(InvoicePayment $payment): void
    {
        $this->recalculate($payment->invoice);
    }

    public function updated(InvoicePayment $payment): void
    {
        $this->recalculate($payment->invoice);
    }

    public function deleted(InvoicePayment $payment): void
    {
        $this->recalculate($payment->invoice);
    }
}
