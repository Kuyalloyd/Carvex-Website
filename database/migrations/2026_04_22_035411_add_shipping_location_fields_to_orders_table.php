<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipping_region')->nullable()->after('shipping_address');
            $table->string('shipping_city')->nullable()->after('shipping_region');
            $table->string('shipping_province')->nullable()->after('shipping_city');
            $table->string('shipping_zip')->nullable()->after('shipping_province');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_region', 'shipping_city', 'shipping_province', 'shipping_zip']);
        });
    }
};
