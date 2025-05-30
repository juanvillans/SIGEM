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
        Schema::create('entry_to_confirmed_details', function (Blueprint $table) {
            $table->id(); 
            $table->string('entity_code');
            $table->string('entity_code_from');
            $table->foreignId('entry_to_confirmed_id');

            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->foreign('entity_code_from')
            ->references('code')
            ->on('hierarchy_entities')
            ->constrained()
            ->onDelete("restrict")
            ->onUpdate("cascade");

            $table->foreignId('product_id');
            $table->foreignId('organization_id');
            $table->integer('guide');
            $table->integer('quantity');
            $table->string('lote_number');
            $table->date('expiration_date');
            $table->foreignId('condition_id');
            $table->string('authority_fullname');
            $table->string('authority_ci');
            $table->string('departure_date');
            $table->string('departure_time');
            $table->string('arrival_time');
            $table->string('search')->nullable(); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_to_confirmed_details');
    }
};
