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
        Schema::table('inventories', function (Blueprint $table) {
            // Add new equipment-related columns if they don't exist
            if (!Schema::hasColumn('inventories', 'area')) {
                $table->string('area')->nullable()->after('product_id');
            }
            if (!Schema::hasColumn('inventories', 'serial')) {
                $table->string('serial', 30)->nullable()->after('area');
            }
            if (!Schema::hasColumn('inventories', 'national_asset')) {
                $table->string('national_asset', 20)->nullable()->after('serial');
            }
            if (!Schema::hasColumn('inventories', 'equipment_status')) {
                $table->enum('equipment_status', ['operativo', 'inoperativo'])->default('operativo')->after('national_asset');
            }
            if (!Schema::hasColumn('inventories', 'last_maintenance_status')) {
                $table->string('last_maintenance_status')->nullable()->after('equipment_status');
            }
            if (!Schema::hasColumn('inventories', 'missing_consumables')) {
                $table->json('missing_consumables')->nullable()->after('last_maintenance_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventories', function (Blueprint $table) {
            $table->dropColumn(['area', 'serial', 'national_asset', 'equipment_status', 'last_maintenance_status', 'missing_consumables']);
        });
    }
};
