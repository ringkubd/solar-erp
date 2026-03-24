<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('task_id')->nullable()->constrained('project_tasks')->nullOnDelete();
            $table->string('type'); // material, labor, subcontractor, logistics
            $table->string('description')->nullable();
            $table->decimal('estimated_amount', 12, 2)->default(0);
            $table->decimal('actual_amount', 12, 2)->default(0);
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_costs');
    }
};
