<?php

namespace App\Listeners;

use App\Events\PaymentReceived;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordCashReceiptJournal
{
    /**
     * Create the event listener.
     */
    public function __construct(private \App\Services\AccountingService $accountingService)
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(PaymentReceived $event): void
    {
        // Auto-generate Journal Entry for Cash Receipt
        $this->accountingService->journalizeReceipt($event->receipt);
    }
}
