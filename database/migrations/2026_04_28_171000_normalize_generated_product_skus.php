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
            ->whereNotNull('sku')
            ->orderBy('id')
            ->chunkById(100, function ($products) {
                foreach ($products as $product) {
                    if (!preg_match('/^PRD-[A-Z0-9]{8}$/', (string) $product->sku)) {
                        continue;
                    }

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
        // This normalizes legacy generated SKUs and is intentionally not reversed.
    }
};
