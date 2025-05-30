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
        Schema::table('request_product_details', function (Blueprint $table) {
            $table->foreignId('request_product_id')->nullable();
            $table->dropColumn('request_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_product_details', function (Blueprint $table) {
            //
        });
    }
};
