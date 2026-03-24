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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->enum('source', ['website','manual','referral','social','other'])->default('manual');
            $table->string('full_name', 150);
            $table->string('company_name', 200)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 30);
            $table->text('address')->nullable();
            $table->string('district', 100)->nullable();
            $table->enum('project_type', ['solar','substation','electrical','amc','other']);
            $table->decimal('load_kw', 10, 2)->nullable();
            $table->decimal('budget_bdt', 15, 2)->nullable();
            $table->enum('stage', ['new','contacted','survey','proposal_sent','negotiation','won','lost'])->default('new');
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->date('expected_close')->nullable();
            $table->string('lost_reason', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
            $table->index('stage', 'idx_stage');
            $table->index('assigned_to', 'idx_assigned');
            $table->index('project_type', 'idx_project_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
