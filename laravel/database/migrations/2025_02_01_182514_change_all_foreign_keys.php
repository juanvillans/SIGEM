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
        Schema::table('nombre_de_la_tabla', function (Blueprint $table) {
            // Eliminar las claves foráneas existentes
            $table->dropForeign(['columna_fk1']); // Reemplaza con tu columna
            $table->dropForeign(['columna_fk2']); // Reemplaza con tu columna

            // Cambiar el tipo si es necesario
            $table->unsignedBigInteger('columna_fk1')->change();
            $table->unsignedBigInteger('columna_fk2')->change();

            // Agregar las nuevas claves foráneas
            $table->foreign('columna_fk1')->references('id')->on('nueva_tabla1')->onDelete('cascade');
            $table->foreign('columna_fk2')->references('id')->on('nueva_tabla2')->onDelete('cascade');
        });
    
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
