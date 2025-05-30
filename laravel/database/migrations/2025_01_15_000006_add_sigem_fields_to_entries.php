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
            // Add new equipment-related columns if they don't exist
            if (!Schema::hasColumn('entries', 'area')) {
                $table->string('area')->nullable()->after('product_id');
            }
            if (!Schema::hasColumn('entries', 'serial')) {
                $table->string('serial', 30)->nullable()->after('area');
            }
            if (!Schema::hasColumn('entries', 'national_asset')) {
                $table->string('national_asset', 20)->nullable()->after('serial');
            }
            if (!Schema::hasColumn('entries', 'equipment_status')) {
                $table->enum('equipment_status', ['operativo', 'inoperativo'])->default('operativo')->after('national_asset');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->dropColumn(['area', 'serial', 'national_asset', 'equipment_status']);
        });
    }
};
