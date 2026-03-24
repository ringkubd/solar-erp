<?php

namespace App\Listeners;

use App\Events\InvoiceCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordAccountsReceivableJournal
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
    public function handle(InvoiceCreated $event): void
    {
        // Auto-generate Journal Entry
        $this->accountingService->journalizeInvoice($event->invoice);
    }
}
