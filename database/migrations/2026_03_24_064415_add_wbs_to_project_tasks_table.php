<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->foreignId('phase_id')->nullable()->constrained('project_phases')->nullOnDelete();
            $table->decimal('estimated_hours', 8, 2)->default(0);
            $table->decimal('actual_hours', 8, 2)->default(0);
            $table->integer('progress_pct')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->dropForeign(['phase_id']);
            $table->dropColumn(['phase_id', 'estimated_hours', 'actual_hours', 'progress_pct']);
        });
    }
};
