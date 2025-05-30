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
        Schema::create('output_generals2', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->integer('code');
            // 1 => En Proceso
            // 2 => Cancelado
            // 3 => Confirmado
            $table->integer('status')->default(1);
            $table->timestamps();

            $table->integer('guide');
            $table->string('departure_time');
            $table->foreignId('organization_id');
            $table->string('authority_fullname');
            $table->string('authority_ci');  
            $table->string('receiver_fullname');
            $table->string('receiver_ci');
            $table->foreignId('municipality_id')->nullable();
            $table->foreignId('parish_id')->nullable();
            $table->foreignId('user_id');
            $table->integer('day');
            $table->integer('month');
            $table->integer('year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('output_generals2');
    }
};
