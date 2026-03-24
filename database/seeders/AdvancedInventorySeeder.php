<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Warehouse;
use App\Models\Vendor;
use App\Models\InventoryCategory;

class AdvancedInventorySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Default Warehouse
        Warehouse::firstOrCreate(
            ['code' => 'CENTRAL-WH'],
            [
                'name' => 'Central Equipment Yard',
                'location' => 'Dhaka Main Depot',
                'is_active' => true
            ]
        );

        // 2. Sample Vendors
        Vendor::firstOrCreate(['name' => 'Jinko Solar Ltd.'], ['contact_person' => 'Mr. Wang', 'email' => 'sales@jinko.com', 'phone' => '+86 123 4567']);
        Vendor::firstOrCreate(['name' => 'Huawei Technologies'], ['contact_person' => 'Sales Dept', 'email' => 'solar@huawei.com']);
        Vendor::firstOrCreate(['name' => 'Local Cable Corp'], ['contact_person' => 'Rahim Ali', 'phone' => '01711223344']);

        // 3. Material Categories
        InventoryCategory::firstOrCreate(['name' => 'Solar Panels']);
        InventoryCategory::firstOrCreate(['name' => 'Inverters']);
        InventoryCategory::firstOrCreate(['name' => 'Cables & Wiring']);
        InventoryCategory::firstOrCreate(['name' => 'Structure & Civil']);
    }
}
