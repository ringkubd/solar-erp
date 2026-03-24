<?php

namespace App\Listeners;

use App\Events\StockConsumed;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordInventoryExpenseJournal
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
    public function handle(StockConsumed $event): void
    {
        if ($event->movement->type === 'out') {
            $this->accountingService->journalizeStockConsumption($event->movement);
        }
    }
}
