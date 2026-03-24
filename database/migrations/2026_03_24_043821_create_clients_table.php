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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lead_id')->nullable();
            $table->string('company_name', 200);
            $table->string('trade_license', 100)->nullable();
            $table->string('tax_id', 100)->nullable();
            $table->text('billing_address')->nullable();
            $table->text('site_address')->nullable();
            $table->string('district', 100)->nullable();
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
