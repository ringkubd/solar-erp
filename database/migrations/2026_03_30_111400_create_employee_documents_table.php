<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('employee_documents', function (Blueprint $row) {
            $row->id();
            $row->foreignId('employee_id')->constrained()->onDelete('cascade');
            $row->string('title');
            $row->string('file_path');
            $row->string('type')->nullable(); // id_card, contract, certificate, etc.
            $row->date('expiry_date')->nullable();
            $row->text('notes')->nullable();
            $row->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('employee_documents');
    }
};
