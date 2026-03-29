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
        Schema::table('email_accounts', function (Blueprint $table) {
            $table->string('status')->default('active')->after('quota_gb'); 
            $table->string('provision_job_id')->nullable()->after('status');
            $table->text('error_log')->nullable()->after('provision_job_id');
        });
    }

    public function down(): void
    {
        Schema::table('email_accounts', function (Blueprint $table) {
            $table->dropColumn(['status', 'provision_job_id', 'error_log']);
        });
    }
};
