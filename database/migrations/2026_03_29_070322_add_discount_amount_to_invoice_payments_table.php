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
        if (!Schema::hasColumn('invoice_payments', 'discount_amount')) {
            Schema::table('invoice_payments', function (Blueprint $table) {
                $table->decimal('discount_amount', 15, 2)->default(0)->after('amount');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('invoice_payments', 'discount_amount')) {
            Schema::table('invoice_payments', function (Blueprint $table) {
                $table->dropColumn('discount_amount');
            });
        }
    }
};
