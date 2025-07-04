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
        Schema::create('entry_to_confirmeds', function (Blueprint $table) {
            $table->id();

            $table->string('entity_code');
            $table->foreign('entity_code')
                  ->references('code')
                  ->on('hierarchy_entities')
                  ->constrained()
                  ->onDelete("restrict")
                  ->onUpdate("cascade");

            $table->string('entity_code_from');
            $table->foreign('entity_code_from')
                ->references('code')
                ->on('hierarchy_entities')
                ->constrained()
                ->onDelete("restrict")
                ->onUpdate("cascade");

            $table->string('area')->nullable();
            $table->foreignId('product_id');
            $table->foreignId('organization_id');
            $table->integer('quantity')->default(1);
            $table->string('serial_number');
            $table->string('national_code');
            $table->foreignId('machine_status_id');
            $table->string('departure_time');
            $table->string('arrival_time');
            $table->json('components');
            $table->foreignId('output_general_id');
            $table->integer('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entry_to_confirmeds');
    }
};

/*

 id                 | bigint                         |           | not null | nextval('entry_to_confirmeds_id_seq'::regclass)
 entity_code        | character varying(255)         |           | not null |
 entity_code_from   | character varying(255)         |           | not null |
 output_general_id  | bigint                         |           | not null |
 guide              | integer                        |           | not null |
 departure_time     | character varying(255)         |           | not null |
 departure_date     | character varying(255)         |           | not null |
 arrival_time       | character varying(255)         |           | not null |
 authority_fullname | character varying(255)         |           | not null |
 authority_ci       | character varying(255)         |           | not null |
 day                | integer                        |           | not null |
 month              | integer                        |           | not null |
 year               | integer                        |           | not null |
 status             | integer                        |           | not null |
 created_at         | timestamp(0) without time zone |           |          |
 updated_at         | timestamp(0) without time zone |           |          |


*/
