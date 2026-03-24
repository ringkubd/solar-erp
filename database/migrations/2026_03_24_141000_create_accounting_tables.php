<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1: Chart of Accounts ──────────────────────────────────────────────
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();          // e.g. 1001, 1100, 4000
            $table->string('name', 150);
            $table->enum('type', [
                'asset',       // Cash, Bank, Receivable
                'liability',   // Payable, Loans
                'equity',      // Owner's Equity, Retained Earnings
                'income',      // Revenue, Sales
                'expense',     // COGS, Salaries, Utilities
            ]);
            $table->unsignedBigInteger('parent_id')->nullable();   // Hierarchy
            $table->boolean('is_system')->default(false);          // Cannot delete system accounts
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('accounts')->onDelete('set null');
            $table->index(['type', 'is_active']);
        });

        // ── 2: Journal Headers ────────────────────────────────────────────────
        Schema::create('journals', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 50)->unique();             // JNL-2026-0001
            $table->date('date');
            $table->string('description', 255);
            $table->enum('source', [
                'manual',
                'invoice',
                'money_receipt',
                'expense',
            ])->default('manual');
            $table->unsignedBigInteger('source_id')->nullable();   // FK to source table
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_posted')->default(false);          // posted = locked
            $table->timestamps();

            $table->index(['date', 'source']);
            $table->index('source_id');
        });

        // ── 3: Journal Entries (Lines) ────────────────────────────────────────
        Schema::create('journal_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('account_id')->constrained()->restrictOnDelete();
            $table->enum('type', ['debit', 'credit']);
            $table->decimal('amount', 15, 2);
            $table->string('narration', 255)->nullable();
            $table->timestamps();

            $table->index(['account_id', 'journal_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_entries');
        Schema::dropIfExists('journals');
        Schema::dropIfExists('accounts');
    }
};
