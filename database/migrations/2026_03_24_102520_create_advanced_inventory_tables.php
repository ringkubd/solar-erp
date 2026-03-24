<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Warehouses
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Extend Inventory Items
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('brand')->nullable()->after('name');
            $table->string('model')->nullable()->after('brand');
            $table->json('specs')->nullable()->after('description');
            $table->decimal('reorder_level', 15, 2)->default(0)->after('min_stock_level');
            $table->decimal('weight_kg', 10, 2)->nullable()->after('unit');
        });

        // 3. Stock per Warehouse (Pivot)
        Schema::create('inventory_warehouse_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->decimal('quantity', 15, 2)->default(0);
            $table->decimal('avg_unit_cost', 15, 2)->default(0); // For Moving Average
            $table->timestamps();
            
            $table->unique(['inventory_item_id', 'warehouse_id'], 'item_warehouse_unique');
        });

        // 4. Vendors
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('bin_no')->nullable(); // Tax ID
            $table->timestamps();
        });

        // 5. Purchase Orders
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_no')->unique();
            $table->foreignId('vendor_id')->constrained();
            $table->date('order_date');
            $table->date('expected_date')->nullable();
            $table->enum('status', ['draft', 'sent', 'partially_received', 'received', 'cancelled'])->default('draft');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->foreignId('created_by')->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('purchase_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained();
            $table->decimal('quantity', 15, 2);
            $table->decimal('received_quantity', 15, 2)->default(0);
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2);
            $table->timestamps();
        });

        // 6. Stock Transfers
        Schema::create('stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_no')->unique();
            $table->foreignId('from_warehouse_id')->constrained('warehouses');
            $table->foreignId('to_warehouse_id')->constrained('warehouses');
            $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
            $table->date('transfer_date');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });

        Schema::create('stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_item_id')->constrained();
            $table->decimal('quantity', 15, 2);
            $table->timestamps();
        });

        // 7. Adding Warehouse & Costing to Stock Movements
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('inventory_item_id')->constrained();
            $table->decimal('total_cost', 15, 2)->nullable()->after('unit_cost');
            $table->string('batch_no')->nullable()->after('total_cost');
        });
    }

    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn(['warehouse_id', 'total_cost', 'batch_no']);
        });
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('vendors');
        Schema::dropIfExists('inventory_warehouse_stocks');
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn(['brand', 'model', 'specs', 'reorder_level', 'weight_kg']);
        });
        Schema::dropIfExists('warehouses');
    }
};
