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
        Schema::create('outputs2', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->integer('output_code');
            $table->unsignedBigInteger('output_general_id');
            $table->foreign('output_general_id')
            ->references('id')
                  ->on('output_generals2')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->unsignedBigInteger('inventory_id');
            $table->foreign('inventory_id')
            ->references('id')
                ->on('inventories2')
                ->constrained()
                ->onDelete("restrict")
                ->onUpdate("cascade");
            
            $table->foreignId('user_id');
            $table->foreignId('product_id');
            $table->foreignId('condition_id');
            $table->bigInteger('quantity');
            $table->foreignId('organization_id');
            $table->foreignId('municipality_id')->nullable();
            $table->foreignId('parish_id')->nullable();
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
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outputs2');
    }
};
