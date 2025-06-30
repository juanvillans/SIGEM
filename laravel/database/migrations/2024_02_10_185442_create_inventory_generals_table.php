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
        Schema::create('inventory_generals', function (Blueprint $table) {
            $table->id();
            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");
            $table->foreignId('product_id');
            $table->string('serial_number', 30);
            $table->string('national_code', 30);
            $table->foreignId('machine_status_id');
            $table->foreignId('organization_id');
            $table->json('components');
            $table->string('area');
            $table->integer('quantity');
            $table->unsignedInteger('entry_general_id');
            $table->foreign('entry_general_id')
            ->references('id')
            ->on('entry_generals')
            ->onDelete('cascade')
            ->onUpdate('cascade');
            $table->unsignedInteger('last_type_maintenance_id')->nullable();
            $table->foreign('last_type_maintenance_id')
                  ->references('id')
                  ->on('type_maintenances')
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->timestamps();

        });

        // Sin inventario detallado
        // Estados de operativo-no operativo- mantenimiento
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_generals');
    }
};
