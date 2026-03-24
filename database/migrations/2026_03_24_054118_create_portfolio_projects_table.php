<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('client_name')->nullable();
            $table->string('project_type');
            $table->string('location')->nullable();
            $table->date('completion_date')->nullable();
            $table->string('capacity')->nullable();
            $table->text('challenge_description')->nullable();
            $table->text('solution_description')->nullable();
            $table->json('gallery_images')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('portfolio_projects');
    }
};
