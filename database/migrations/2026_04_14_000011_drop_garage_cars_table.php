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
        Schema::dropIfExists('garage_cars');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('garage_cars', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('make', 120);
            $table->string('model', 120);
            $table->string('year', 10);
            $table->text('notes')->nullable();
            $table->longText('image_data')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }
};
