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
        Schema::create('entry_to_confirmeds', function (Blueprint $table) {
            $table->id();
    
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");
    
            $table->string('entity_code_from');
            $table->foreign('entity_code_from')
                ->references('code')
                ->on('hierarchy_entities')
                ->constrained()
                ->onDelete("restrict")
                ->onUpdate("cascade");
            
            $table->foreignId('output_general_id');
            $table->integer('guide');
            $table->string('departure_time');
            $table->string('departure_date');
            $table->string('arrival_time');
            $table->string('authority_fullname');
            $table->string('authority_ci');
            $table->integer('day');
            $table->integer('month');
            $table->integer('year');
            $table->integer('status');



            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_to_confirmeds');
    }
};
