<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Using DB::statement because updating ENUM in MySQL via Schema is limited
        DB::statement("ALTER TABLE journals MODIFY COLUMN source ENUM('manual', 'invoice', 'money_receipt', 'expense', 'payroll') NOT NULL DEFAULT 'manual'");
    }

    public function down()
    {
        DB::statement("ALTER TABLE journals MODIFY COLUMN source ENUM('manual', 'invoice', 'money_receipt', 'expense') NOT NULL DEFAULT 'manual'");
    }
};
