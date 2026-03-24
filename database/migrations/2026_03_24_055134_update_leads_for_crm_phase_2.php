<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->integer('lead_score')->default(0)->after('stage');
            $table->dateTime('next_follow_up_date')->nullable()->after('lead_score');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['lead_score', 'next_follow_up_date']);
        });
    }
};
