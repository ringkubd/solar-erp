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
        Schema::table('project_tasks', function (Blueprint $table) {
            // Change enum to string for status and priority to allow new values (pending, completed, delayed, etc.)
            $table->string('status')->default('pending')->change();
            $table->string('priority')->default('medium')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->enum('status', ['todo','in_progress','review','done'])->default('todo')->change();
            $table->enum('priority', ['low','medium','high','urgent'])->default('medium')->change();
        });
    }
};
