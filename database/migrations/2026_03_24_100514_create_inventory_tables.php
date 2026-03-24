<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_category_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('sku')->unique();
            $table->string('unit')->default('pcs'); // pcs, meter, kg, set
            $table->decimal('min_stock_level', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out']);
            $table->decimal('quantity', 15, 2);
            $table->string('reference_type')->nullable(); // purchase, project_usage, adjustment, return
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('unit_cost', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->timestamps();
            
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};
