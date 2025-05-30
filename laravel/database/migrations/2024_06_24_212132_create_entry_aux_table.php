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
        Schema::create('entry_aux', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->integer('entry_code');
            $table->foreignId('product_id');
            $table->bigInteger('quantity');
            $table->foreignId('organization_id');
            $table->string('guide');
            $table->string('lote_number');
            $table->date('expiration_date')->nullable();
            $table->integer('condition_id');
            $table->string('authority_fullname');
            $table->string('authority_ci');      
            $table->string('arrival_time');
            $table->integer('day');
            $table->integer('month');
            $table->integer('year');
            $table->string('description',200)->nullable();
            $table->string('search',1000)->nullable();
            $table->integer('user_id');
            $table->integer('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_aux');
    }
};
