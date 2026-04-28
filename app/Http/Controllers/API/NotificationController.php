<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $limit = max(1, min(50, (int) $request->query('limit', 12)));

        $notifications = $user->notifications()
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (DatabaseNotification $notification) => $this->transformNotification($notification))
            ->values();

        return response()->json([
            'message' => 'Notifications retrieved successfully',
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markRead(Request $request, string $notificationId)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        /** @var DatabaseNotification|null $notification */
        $notification = $user->notifications()->where('id', $notificationId)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => [
                'notification' => $this->transformNotification($notification->fresh()),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read',
            'data' => [
                'unread_count' => 0,
            ],
        ]);
    }

    private function transformNotification(DatabaseNotification $notification): array
    {
        $data = is_array($notification->data) ? $notification->data : [];

        return [
            'id' => $notification->id,
            'title' => (string) ($data['title'] ?? 'Notification'),
            'message' => (string) ($data['message'] ?? ''),
            'full_message' => (string) ($data['full_message'] ?? $data['message'] ?? ''),
            'link' => (string) ($data['link'] ?? '/dashboard'),
            'kind' => (string) ($data['kind'] ?? 'general'),
            'concern_id' => $data['concern_id'] ?? null,
            'subject' => (string) ($data['subject'] ?? ''),
            'status' => (string) ($data['status'] ?? ''),
            'promo_code' => (string) ($data['promo_code'] ?? ''),
            'discount_type' => (string) ($data['discount_type'] ?? ''),
            'discount_value' => array_key_exists('discount_value', $data) ? (float) $data['discount_value'] : null,
            'minimum_order_amount' => array_key_exists('minimum_order_amount', $data) ? (float) $data['minimum_order_amount'] : null,
            'expires_at' => (string) ($data['expires_at'] ?? ''),
            'order_id' => $data['order_id'] ?? null,
            'order_number' => (string) ($data['order_number'] ?? ''),
            'read_at' => optional($notification->read_at)->toISOString(),
            'created_at' => optional($notification->created_at)->toISOString(),
        ];
    }
}
