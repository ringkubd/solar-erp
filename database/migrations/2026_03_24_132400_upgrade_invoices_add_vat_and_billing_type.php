<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Update invoices table
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('billing_type', 20)->default('item')->after('project_id'); // 'item' or 'milestone'
            $table->unsignedBigInteger('milestone_id')->nullable()->after('billing_type'); // FK to project_phases
            $table->decimal('vat_amount', 15, 2)->default(0)->after('tax_pct');    // computed VAT BDT
            $table->decimal('balance_due', 15, 2)->default(0)->after('amount_paid');
            $table->char('currency', 3)->default('BDT')->after('balance_due');
            $table->timestamp('sent_at')->nullable()->after('currency');

            $table->foreign('milestone_id')->references('id')->on('project_phases')->onDelete('set null');
        });

        // Step 2: Update invoice_items table
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->string('item_type', 30)->default('service')->after('description'); // service, material, labor, milestone, other
            $table->string('unit', 50)->nullable()->after('unit_price');               // pcs, kWp, hours
            $table->decimal('vat_pct', 5, 2)->default(0)->after('unit');              // per-line VAT %
            $table->decimal('vat_amount', 15, 2)->default(0)->after('vat_pct');       // computed
            $table->decimal('discount_pct', 5, 2)->default(0)->after('vat_amount');
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropColumn(['item_type', 'unit', 'vat_pct', 'vat_amount', 'discount_pct']);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropForeign(['milestone_id']);
            $table->dropColumn(['billing_type', 'milestone_id', 'vat_amount', 'balance_due', 'currency', 'sent_at']);
        });
    }
};
