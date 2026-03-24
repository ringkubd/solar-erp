<?php

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\InventoryItem;

$items = InventoryItem::all();

foreach ($items as $item) {
    $totalStock = $item->totalStock();
    $minStock = $item->min_stock_level;
    $isLow = $totalStock <= $minStock;
    
    echo "Item: {$item->name} (SKU: {$item->sku})\n";
    echo "  Total Stock: {$totalStock}\n";
    echo "  Min Stock Level: " . ($minStock ?? 'NULL') . "\n";
    echo "  Is Low: " . ($isLow ? 'YES' : 'NO') . "\n";
    echo "---------------------------------\n";
}
