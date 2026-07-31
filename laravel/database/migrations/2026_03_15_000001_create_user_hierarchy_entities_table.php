<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('user_hierarchy_entities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'entity_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_hierarchy_entities');
    }
};
