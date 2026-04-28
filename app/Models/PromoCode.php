<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'max_uses',
        'used_count',
        'assigned_user_id',
        'created_by_user_id',
        'is_active',
        'starts_at',
        'expires_at',
        'sent_at',
    ];

    protected $casts = [
        'discount_value' => 'float',
        'minimum_order_amount' => 'float',
        'max_uses' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'CVX-' . Str::upper(Str::random(6));
        } while (static::query()->where('code', $code)->exists());

        return $code;
    }

    public function calculateDiscount(float $subtotal): float
    {
        $subtotal = max(0, round($subtotal, 2));

        if ($this->discount_type === 'percentage') {
            return round($subtotal * ((float) $this->discount_value / 100), 2);
        }

        return min($subtotal, round((float) $this->discount_value, 2));
    }

    public function canBeUsedBy(?User $user, float $subtotal): ?string
    {
        if (!$this->is_active) {
            return 'This promo code is no longer active.';
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return 'This promo code is not active yet.';
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return 'This promo code has already expired.';
        }

        if ($this->max_uses !== null && (int) $this->used_count >= (int) $this->max_uses) {
            return 'This promo code has already been fully used.';
        }

        if ($this->assigned_user_id && (!$user || (int) $this->assigned_user_id !== (int) $user->id)) {
            return 'This promo code is assigned to a different customer account.';
        }

        if ($subtotal < (float) $this->minimum_order_amount) {
            return 'This promo code requires a minimum order of ' . number_format((float) $this->minimum_order_amount, 2) . '.';
        }

        return null;
    }
}
