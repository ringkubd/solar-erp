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
        Schema::create('proposal_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proposal_id');
            $table->string('category', 100)->nullable();
            $table->text('description');
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->decimal('qty', 10, 2);
            $table->string('unit', 30)->nullable();
            $table->decimal('unit_price', 15, 2);
            $table->decimal('total_price', 15, 2)->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();

            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_items');
    }
};
