<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('product_category_id')->nullable()->after('id');
            $table->string('slug')->after('title')->nullable();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->after('title')->nullable();
            $table->longText('detailed_content')->nullable()->after('description');
        });

        // Auto-generate slugs for existing items
        $products = DB::table('products')->get();
        foreach ($products as $p) {
            DB::table('products')->where('id', $p->id)->update(['slug' => Str::slug($p->title) . '-' . uniqid()]);
        }

        $services = DB::table('services')->get();
        foreach ($services as $s) {
            DB::table('services')->where('id', $s->id)->update(['slug' => Str::slug($s->title) . '-' . uniqid()]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['product_category_id', 'slug']);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['slug', 'detailed_content']);
        });
    }
};
