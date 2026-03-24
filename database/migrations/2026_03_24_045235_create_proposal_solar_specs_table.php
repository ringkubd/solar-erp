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
        Schema::create('proposal_solar_specs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proposal_id')->unique();
            $table->decimal('system_size_kw', 10, 2);
            $table->decimal('annual_gen_kwh', 12, 2)->nullable();
            $table->integer('panel_qty')->nullable();
            $table->integer('panel_watt')->nullable();
            $table->string('inverter_brand', 100)->nullable();
            $table->decimal('inverter_kw', 10, 2)->nullable();
            $table->decimal('battery_kwh', 10, 2)->nullable();
            $table->decimal('avg_monthly_bill', 12, 2)->nullable();
            $table->decimal('monthly_savings', 12, 2)->nullable();
            $table->decimal('payback_years', 5, 2)->nullable();
            $table->decimal('roi_pct', 6, 2)->nullable();
            $table->timestamps();

            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_solar_specs');
    }
};
