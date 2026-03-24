<?php

namespace App\Listeners;

use App\Events\StockPurchased;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RecordInventoryAssetJournal
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
    public function handle(StockPurchased $event): void
    {
        if ($event->movement->type === 'in' && $event->movement->reference_type === 'purchase') {
            $this->accountingService->journalizePurchase($event->movement);
        }
    }
}
