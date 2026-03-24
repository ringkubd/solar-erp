<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\StockMovement;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Categories
        $cats = [
            ['name' => 'Solar Panels', 'description' => 'Photovoltaic modules'],
            ['name' => 'Inverters',    'description' => 'DC to AC converters'],
            ['name' => 'Cables',       'description' => 'DC/AC wiring and connectors'],
            ['name' => 'Transformers', 'description' => 'Step-up/Step-down power units'],
            ['name' => 'Mounting',     'description' => 'Structure and rail systems'],
        ];

        foreach ($cats as $cat) {
            $category = InventoryCategory::create($cat);

            // 2. Add some items to each category
            if ($cat['name'] === 'Solar Panels') {
                $item = InventoryItem::create([
                    'inventory_category_id' => $category->id,
                    'name' => 'Jinko 550W Mono Facial',
                    'sku'  => 'SOL-JK-550',
                    'unit' => 'pcs',
                    'min_stock_level' => 50,
                ]);

                // Initial Stock
                StockMovement::create([
                    'inventory_item_id' => $item->id,
                    'type' => 'in',
                    'quantity' => 200,
                    'reference_type' => 'adjustment',
                    'notes' => 'Opening stock',
                ]);
            }

            if ($cat['name'] === 'Inverters') {
                $item = InventoryItem::create([
                    'inventory_category_id' => $category->id,
                    'name' => 'Huawei SUN2000-100KTL',
                    'sku'  => 'INV-HW-100',
                    'unit' => 'pcs',
                    'min_stock_level' => 5,
                ]);

                StockMovement::create([
                    'inventory_item_id' => $item->id,
                    'type' => 'in',
                    'quantity' => 15,
                    'reference_type' => 'adjustment',
                    'notes' => 'Opening stock',
                ]);
            }
        }
    }
}
