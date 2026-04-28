<?php

use App\Models\Product;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Product::query()
            ->where(function ($query) {
                $query->whereNull('sku')
                    ->orWhere('sku', '');
            })
            ->orderBy('id')
            ->chunkById(100, function ($products) {
                foreach ($products as $product) {
                    $product->sku = Product::generateUniqueSku($product->name, $product->id);
                    $product->saveQuietly();
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This is a one-way data backfill. Existing SKUs are intentionally preserved.
    }
};
