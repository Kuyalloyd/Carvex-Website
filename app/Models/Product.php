<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'brand',
        'description',
        'price',
        'stock',
        'vehicle_compatibility',
        'images',
        'is_active',
        'is_hot_deal',
        'is_premium'
    ];

    protected $casts = [
        'images' => 'array',
        'is_active' => 'boolean',
        'is_hot_deal' => 'boolean',
        'is_premium' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
}
