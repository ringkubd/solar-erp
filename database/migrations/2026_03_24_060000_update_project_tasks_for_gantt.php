<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('priority');
            $table->integer('progress')->default(0)->after('start_date');
            $table->unsignedBigInteger('depends_on_task_id')->nullable()->after('parent_id');

            $table->foreign('depends_on_task_id')->references('id')->on('project_tasks')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->dropForeign(['depends_on_task_id']);
            $table->dropColumn(['start_date', 'progress', 'depends_on_task_id']);
        });
    }
};
