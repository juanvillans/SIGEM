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
        Schema::create('output_auxes', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->integer('output_code');
            $table->integer('user_id');
            $table->integer('product_id');
            $table->integer('condition_id');
            $table->bigInteger('quantity');
            $table->integer('organization_id')->nullable();
            $table->integer('municipality_id')->nullable();
            $table->integer('parish_id');
            $table->integer('guide');
            $table->string('lote_number');
            $table->string('authority_fullname');
            $table->string('authority_ci');  
            $table->string('departure_time');
            $table->string('receiver_fullname');
            $table->string('receiver_ci');
            $table->date('expiration_date');
            $table->integer('day');
            $table->integer('month');
            $table->integer('year');
            $table->string('description',200);
            $table->string('search', 10000);
            $table->integer('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('output_auxes');
    }
};
