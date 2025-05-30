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
            // Check if foreign keys exist before dropping them
            if (Schema::hasColumn('products', 'medicament_id')) {
                try {
                    $table->dropForeign(['medicament_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist, continue
                }
            }

            if (Schema::hasColumn('products', 'type_administration_id')) {
                try {
                    $table->dropForeign(['type_administration_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist, continue
                }
            }

            if (Schema::hasColumn('products', 'type_presentation_id')) {
                try {
                    $table->dropForeign(['type_presentation_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist, continue
                }
            }

            // Drop columns if they exist
            $columnsToRemove = ['medicament_id', 'type_administration_id', 'type_presentation_id', 'unit_per_package', 'concentration_size'];
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('products', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Rename name to equipment_name if name column exists
            if (Schema::hasColumn('products', 'name') && !Schema::hasColumn('products', 'equipment_name')) {
                $table->renameColumn('name', 'equipment_name');
            }

            // Add new equipment-related columns if they don't exist
            if (!Schema::hasColumn('products', 'brand')) {
                $table->string('brand')->after('equipment_name');
            }
            if (!Schema::hasColumn('products', 'model')) {
                $table->string('model')->after('brand');
            }
            if (!Schema::hasColumn('products', 'consumables')) {
                $table->json('consumables')->nullable()->after('model');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Reverse the changes
            $table->renameColumn('equipment_name', 'name');

            $table->dropColumn([
                'brand',
                'model',
                'consumables'
            ]);

            // Add back old columns
            $table->foreignId('medicament_id')->after('category_id');
            $table->foreignId('type_administration_id')->after('medicament_id');
            $table->foreignId('type_presentation_id')->after('type_administration_id');
            $table->integer('unit_per_package')->after('type_presentation_id');
            $table->string('concentration_size')->after('unit_per_package');
        });
    }
};
