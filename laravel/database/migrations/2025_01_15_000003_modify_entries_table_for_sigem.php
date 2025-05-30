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
            // Drop old medicine-related columns if they exist
            $columnsToRemove = ['quantity', 'lote_number', 'expiration_date'];
            foreach ($columnsToRemove as $column) {
                if (Schema::hasColumn('entries', $column)) {
                    $table->dropColumn($column);
                }
            }

            // Add new equipment-related columns if they don't exist
            if (!Schema::hasColumn('entries', 'area')) {
                $table->string('area')->after('product_id');
            }
            if (!Schema::hasColumn('entries', 'serial')) {
                $table->string('serial', 30)->after('area');
            }
            if (!Schema::hasColumn('entries', 'national_asset')) {
                $table->string('national_asset', 20)->after('serial');
            }
            if (!Schema::hasColumn('entries', 'status')) {
                $table->enum('status', ['operativo', 'inoperativo'])->default('operativo')->after('national_asset');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            // Remove new columns
            $table->dropColumn([
                'area',
                'serial',
                'national_asset',
                'status'
            ]);

            // Add back old columns
            $table->integer('quantity')->after('product_id');
            $table->string('lote_number')->after('guide');
            $table->date('expiration_date')->after('lote_number');
        });
    }
};
