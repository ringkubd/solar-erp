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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('project_no', 30)->unique();
            $table->unsignedBigInteger('proposal_id')->nullable();
            $table->unsignedBigInteger('client_id');
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->enum('type', ['solar','substation','electrical','amc','other']);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['planning','active','on_hold','completed','cancelled'])->default('planning');
            $table->decimal('budget', 15, 2)->nullable();
            $table->unsignedBigInteger('manager_id')->nullable();
            $table->timestamps();

            $table->foreign('proposal_id')->references('id')->on('proposals')->onDelete('set null');
            $table->foreign('client_id')->references('id')->on('clients')->onDelete('cascade');
            $table->foreign('manager_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
