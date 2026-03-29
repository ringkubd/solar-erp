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
        // 1. Upgrade Employees for Authentication
        Schema::table('employees', function (Blueprint $table) {
            $table->string('password')->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('status');
        });

        // 2. Upgrade Clients for Authentication & Portal
        Schema::table('clients', function (Blueprint $table) {
            $table->string('email')->unique()->nullable()->after('company_name');
            $table->string('password')->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('district');
        });

        // 3. Accounting: Add Project Cost Center to Journal Entries
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->foreignId('project_id')->nullable()->after('account_id')->constrained()->onDelete('set null');
        });

        // 4. HR: Project Assignment Pivot Table
        Schema::create('project_employee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('role_in_project')->nullable(); // Manager, Lead, Member
            $table->timestamps();
            
            $table->unique(['project_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_employee');
        
        Schema::table('journal_entries', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn('project_id');
        });

        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'is_active']);
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['password', 'is_active']);
        });
    }
};
