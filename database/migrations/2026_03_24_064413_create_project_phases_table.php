<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // Engineering, Procurement, Civil Works
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('pending'); // pending, running, completed, delayed
            $table->integer('progress_pct')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_phases');
    }
};
