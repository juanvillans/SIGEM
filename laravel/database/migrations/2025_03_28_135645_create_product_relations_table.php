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
        Schema::create('product_relations', function (Blueprint $table) {
           
            $table->id();
            $table->unsignedBigInteger('product_macro_id');
            $table->unsignedBigInteger('product_micro_id');

            $table->foreign('product_macro_id')
                ->references('id')
                ->on('products')
                ->onDelete('restrict'); 

            $table->foreign('product_micro_id')
                ->references('id')
                ->on('products')
                ->onDelete('restrict');

            $table->timestamps();

            

        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_relations');
    }
};
