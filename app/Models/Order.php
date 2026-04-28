<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'payment_method',
        'payment_status',
        'promo_code',
        'payment_details',
        'tracking_number',
        'total_amount',
        'tax_amount',
        'shipping_amount',
        'discount_amount',
        'shipping_address',
        'shipping_region',
        'shipping_city',
        'shipping_province',
        'shipping_zip',
        'notes',
        'paid_at',
        'shipped_at',
        'delivered_at'
    ];

    protected $casts = [
        'payment_details' => 'array',
        'discount_amount' => 'float',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

}
