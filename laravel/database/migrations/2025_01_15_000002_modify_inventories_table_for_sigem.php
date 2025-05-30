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
            // Drop old medicine-related columns if they exist
            $columnsToRemove = ['lote_number', 'expiration_date', 'stock'];
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('inventories', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Add new equipment-related columns if they don't exist
            if (!Schema::hasColumn('inventories', 'area')) {
                $table->string('area')->after('product_id');
            }
            if (!Schema::hasColumn('inventories', 'serial')) {
                $table->string('serial', 30)->after('area');
            }
            if (!Schema::hasColumn('inventories', 'national_asset')) {
                $table->string('national_asset', 20)->after('serial');
            }
            if (!Schema::hasColumn('inventories', 'status')) {
                $table->enum('status', ['operativo', 'inoperativo'])->default('operativo')->after('national_asset');
            }
            if (!Schema::hasColumn('inventories', 'last_maintenance_status')) {
                $table->string('last_maintenance_status')->nullable()->after('status');
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
            // Remove new columns
            $table->dropColumn([
                'area',
                'serial',
                'national_asset',
                'status',
                'last_maintenance_status',
                'missing_consumables'
            ]);

            // Add back old columns
            $table->string('lote_number')->after('product_id');
            $table->date('expiration_date')->nullable()->after('lote_number');
            $table->integer('stock')->default(0)->after('expiration_date');
        });
    }
};
