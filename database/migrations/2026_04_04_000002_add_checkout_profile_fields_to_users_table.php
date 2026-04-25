<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'billing_address')) {
                $table->string('billing_address')->nullable()->after('address');
            }

            if (!Schema::hasColumn('users', 'shipping_address')) {
                $table->string('shipping_address')->nullable()->after('billing_address');
            }

            if (!Schema::hasColumn('users', 'payment_method')) {
                $table->string('payment_method', 50)->nullable()->after('shipping_address');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $drop = [];

            if (Schema::hasColumn('users', 'payment_method')) {
                $drop[] = 'payment_method';
            }

            if (Schema::hasColumn('users', 'shipping_address')) {
                $drop[] = 'shipping_address';
            }

            if (Schema::hasColumn('users', 'billing_address')) {
                $drop[] = 'billing_address';
            }

            if (!empty($drop)) {
                $table->dropColumn($drop);
            }
        });
    }
};
