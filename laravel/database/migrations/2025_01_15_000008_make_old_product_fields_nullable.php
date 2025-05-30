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
        Schema::table('products', function (Blueprint $table) {
            // Make old medicine-related fields nullable so they don't interfere with new equipment data
            if (Schema::hasColumn('products', 'type_presentation_id')) {
                $table->unsignedBigInteger('type_presentation_id')->nullable()->change();
            }
            if (Schema::hasColumn('products', 'type_administration_id')) {
                $table->unsignedBigInteger('type_administration_id')->nullable()->change();
            }
            if (Schema::hasColumn('products', 'medicament_id')) {
                $table->unsignedBigInteger('medicament_id')->nullable()->change();
            }
            if (Schema::hasColumn('products', 'unit_per_package')) {
                $table->integer('unit_per_package')->nullable()->change();
            }
            if (Schema::hasColumn('products', 'concentration_size')) {
                $table->string('concentration_size')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Revert to not null (this might fail if there are null values)
            if (Schema::hasColumn('products', 'type_presentation_id')) {
                $table->unsignedBigInteger('type_presentation_id')->nullable(false)->change();
            }
            if (Schema::hasColumn('products', 'type_administration_id')) {
                $table->unsignedBigInteger('type_administration_id')->nullable(false)->change();
            }
            if (Schema::hasColumn('products', 'medicament_id')) {
                $table->unsignedBigInteger('medicament_id')->nullable(false)->change();
            }
            if (Schema::hasColumn('products', 'unit_per_package')) {
                $table->integer('unit_per_package')->nullable(false)->change();
            }
            if (Schema::hasColumn('products', 'concentration_size')) {
                $table->string('concentration_size')->nullable(false)->change();
            }
        });
    }
};
