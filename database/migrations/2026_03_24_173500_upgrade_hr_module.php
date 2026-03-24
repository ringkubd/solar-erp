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
        // 1. Designations
        Schema::create('designations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('department_id')->constrained()->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 2. Upgrade Employees
        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->onDelete('set null');
            $table->foreignId('designation_id')->nullable()->after('department_id')->constrained()->onDelete('set null');
            $table->json('salary_structure')->nullable()->after('salary');
            $table->string('contract_file')->nullable()->after('address');
        });

        // 3. Attendance
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->time('check_in')->nullable();
            $table->time('check_out')->nullable();
            $table->enum('status', ['present', 'absent', 'on_leave', 'half_day'])->default('present');
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['employee_id', 'date']);
        });

        // 4. Timesheets
        Schema::create('timesheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_task_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('hours', 5, 2);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 5. Payroll
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->integer('month');
            $table->integer('year');
            $table->decimal('base_salary', 15, 2);
            $table->decimal('bonus', 15, 2)->default(0);
            $table->decimal('deductions', 15, 2)->default(0);
            $table->decimal('overtime_pay', 15, 2)->default(0);
            $table->decimal('net_salary', 15, 2);
            $table->enum('status', ['draft', 'processed', 'paid'])->default('draft');
            $table->foreignId('journal_id')->nullable()->constrained('journals'); // Link to accounting
            $table->timestamps();
            
            $table->unique(['employee_id', 'month', 'year']);
        });

        // 6. Employee Documents
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('file_path');
            $table->date('expiry_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('timesheets');
        Schema::dropIfExists('attendances');
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['designation_id']);
            $table->dropColumn(['user_id', 'designation_id', 'salary_structure', 'contract_file']);
        });
        Schema::dropIfExists('designations');
    }
};
