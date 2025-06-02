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
        Schema::table('entries', function (Blueprint $table) {
            // Agregar columna serial después de lote_number
            $table->string('serial', 30)->nullable()->after('lote_number');

            // Agregar columna bien_nacional después de serial
            $table->string('bien_nacional', 50)->nullable()->after('serial');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->dropColumn(['serial', 'bien_nacional']);
        });
    }
};
