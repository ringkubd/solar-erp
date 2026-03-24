<?php

namespace Tests\Feature\Inventory;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\PurchaseOrder;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PurchaseOrderStatusTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $warehouse;
    protected $vendor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->user);
        
        $this->warehouse = Warehouse::create([
            'name' => 'Main Warehouse',
            'code' => 'MAIN',
            'is_active' => true,
        ]);

        $this->vendor = Vendor::create([
            'name' => 'Test Vendor',
        ]);
    }

    public function test_po_status_becomes_received_when_fully_received()
    {
        $category = InventoryCategory::create(['name' => 'Test Category']);
        $item = InventoryItem::create([
            'inventory_category_id' => $category->id,
            'name' => 'Test Item',
            'sku' => 'TEST-001',
            'unit' => 'pcs',
        ]);

        // 1. Create PO
        $response = $this->postJson('/api/v1/inventory/purchase-orders', [
            'vendor_id' => $this->vendor->id,
            'order_date' => now()->toDateString(),
            'items' => [
                ['inventory_item_id' => $item->id, 'quantity' => 10, 'unit_price' => 100]
            ]
        ]);

        $response->assertStatus(201);
        $poId = $response->json('id');

        // 2. Receive partially
        $this->postJson("/api/v1/inventory/purchase-orders/{$poId}/receive", [
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                ['id' => $item->id, 'quantity' => 5]
            ]
        ])->assertStatus(200);

        $this->assertEquals('partially_received', PurchaseOrder::find($poId)->status);

        // 3. Receive remaining
        $this->postJson("/api/v1/inventory/purchase-orders/{$poId}/receive", [
            'warehouse_id' => $this->warehouse->id,
            'items' => [
                ['id' => $item->id, 'quantity' => 5]
            ]
        ])->assertStatus(200);

        // This was failing before the fix due to stale relation
        $this->assertEquals('received', PurchaseOrder::find($poId)->status);
    }

    public function test_it_prevents_fractional_quantity_for_discrete_items()
    {
        $category = InventoryCategory::create(['name' => 'Test Category']);
        $item = InventoryItem::create([
            'inventory_category_id' => $category->id,
            'name' => 'Discrete Item',
            'sku' => 'DISC-001',
            'unit' => 'pcs', // Discrete
        ]);

        // Attempt to create PO with 2.5 units
        $response = $this->postJson('/api/v1/inventory/purchase-orders', [
            'vendor_id' => $this->vendor->id,
            'order_date' => now()->toDateString(),
            'items' => [
                ['inventory_item_id' => $item->id, 'quantity' => 2.5, 'unit_price' => 100]
            ]
        ]);

        $response->assertStatus(422);
        // The message is from our custom Exception in InventoryService
        $this->assertStringContainsString('cannot have fractional quantities', $response->json('message'));
    }

    public function test_it_allows_fractional_quantity_for_non_discrete_items()
    {
        $category = InventoryCategory::create(['name' => 'Test Category']);
        $item = InventoryItem::create([
            'inventory_category_id' => $category->id,
            'name' => 'Continuous Item',
            'sku' => 'CONT-001',
            'unit' => 'kg', // Not in discrete list
        ]);

        // Attempt to create PO with 2.5 units
        $response = $this->postJson('/api/v1/inventory/purchase-orders', [
            'vendor_id' => $this->vendor->id,
            'order_date' => now()->toDateString(),
            'items' => [
                ['inventory_item_id' => $item->id, 'quantity' => 2.5, 'unit_price' => 100]
            ]
        ]);

        $response->assertStatus(201);
    }
}
