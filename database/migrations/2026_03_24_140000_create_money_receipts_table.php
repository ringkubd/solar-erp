<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('money_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_no', 30)->unique();                            // auto-generated: RCP-2026-0001

            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');

            $table->decimal('amount', 15, 2);
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'mobile_banking', 'other'])->default('bank_transfer');
            $table->string('transaction_ref', 150)->nullable();    // bank TxID, cheque no, MFS ref
            $table->date('receipt_date');
            $table->text('notes')->nullable();

            $table->softDeletes();
            $table->timestamps();

            // Indexes for common filter operations
            $table->index('client_id');
            $table->index('invoice_id');
            $table->index('receipt_date');
            $table->index('payment_method');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('money_receipts');
    }
};
