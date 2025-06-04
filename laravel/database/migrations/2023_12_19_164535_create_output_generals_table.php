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
        Schema::create('output_generals', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->integer('code');
            $table->string('area')->nullable();
            $table->foreignId('user_id');
            $table->foreignId('product_id');
            $table->foreignId('machine_status_id');
            $table->integer('quantity');
            $table->foreignId('organization_id')->nullable();
            $table->foreignId('municipality_id')->nullable();
            $table->foreignId('parish_id')->nullable();
            $table->string('serial_number');
            $table->string('description',200);
            $table->integer('status');
            $table->string('departure_time');
            $table->timestamps();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('output_generals');
    }
};
