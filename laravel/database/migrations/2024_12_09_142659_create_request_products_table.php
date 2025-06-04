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
        Schema::create('request_products', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->string('entity_code_destiny');
            $table->foreign('entity_code_destiny')
                ->references('code')
                ->on('hierarchy_entities')
                ->constrained()
                ->onDelete("restrict")
                ->onUpdate("cascade");

            $table->integer('code');
            $table->string('comment');
            $table->integer('status');
            $table->unsignedInteger('output_general_id')->nullable();
            $table->foreign('output_general_id')
                ->references('id')
                ->on('output_generals')
                ->constrained()
                ->onDelete("restrict")
                ->onUpdate("cascade");

            $table->foreignId('product_id');
            $table->integer('quantity');
            $table->string('serial_number');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_products');
    }
};

