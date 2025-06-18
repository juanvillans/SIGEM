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
        Schema::create('entry_generals', function (Blueprint $table) {

            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->integer('code');
            $table->string('area')->nullable();
            $table->foreignId('product_id');
            $table->integer('quantity')->default(1);
            $table->string('serial_number', 30);
            $table->string('national_code', 30);
            $table->foreignId('organization_id');
            $table->foreignId('machine_status_id');
            $table->foreignId('user_id');
            $table->json('components');
            $table->timestamps();
            $table->string('arrival_time');
            $table->integer('status');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_generals');
    }
};
