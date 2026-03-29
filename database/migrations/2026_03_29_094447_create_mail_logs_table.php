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
        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('email_account_id')->constrained()->onDelete('cascade');
            $table->string('subject')->nullable();
            $table->string('recipient');
            $table->enum('type', ['sent', 'received'])->default('sent');
            $table->boolean('is_success')->default(true);
            $table->text('error_message')->nullable();
            $table->ipAddress('sender_ip')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mail_logs');
    }
};
