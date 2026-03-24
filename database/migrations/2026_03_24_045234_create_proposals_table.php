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
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->string('proposal_no', 30)->unique();
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('client_id')->nullable();
            $table->enum('template_type', ['solar_rooftop','industrial_solar','substation','electrical','amc']);
            $table->unsignedSmallInteger('version')->default(1);
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('title', 255);
            $table->date('valid_until');
            $table->char('currency', 3)->default('BDT');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_pct', 5, 2)->default(0);
            $table->decimal('vat_pct', 5, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->enum('status', ['draft','sent','viewed','accepted','rejected','expired'])->default('draft');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->string('pdf_path', 255)->nullable();
            $table->boolean('ai_generated')->default(false);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('set null');
            $table->foreign('parent_id')->references('id')->on('proposals')->onDelete('set null');
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->index('status', 'idx_status');
            $table->index('lead_id', 'idx_prop_lead_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
