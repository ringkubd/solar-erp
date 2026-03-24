<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_materials', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('item_name', 200);
            $table->decimal('quantity_required', 10, 2);
            $table->decimal('quantity_used', 10, 2)->default(0);
            $table->enum('status', ['pending', 'procured', 'installed'])->default('pending');
            $table->timestamps();

            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_materials');
    }
};
