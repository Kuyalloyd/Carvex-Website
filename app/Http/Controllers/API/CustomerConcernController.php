<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CustomerConcern;
use Illuminate\Http\Request;

class CustomerConcernController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $query = CustomerConcern::query()->latest();

        if (!method_exists($user, 'isAdmin') || !$user->isAdmin()) {
            $query->where('user_id', (string) $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->input('status'));
        }

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('subject', 'like', '%' . $search . '%')
                    ->orWhere('message', 'like', '%' . $search . '%');
            });
        }

        $perPage = max(1, min(100, (int) $request->input('per_page', 20)));
        $concerns = $query->paginate($perPage);

        return response()->json([
            'message' => 'Customer concerns retrieved',
            'data' => [
                'data' => $concerns->items(),
                'total' => $concerns->total(),
                'current_page' => $concerns->currentPage(),
                'per_page' => $concerns->perPage(),
                'last_page' => $concerns->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $concern = CustomerConcern::create([
            'user_id' => (string) $user->id,
            'name' => $user->name ?: ($validated['name'] ?? 'Customer'),
            'email' => $user->email ?: ($validated['email'] ?? ''),
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Your concern was submitted successfully',
            'data' => $concern,
        ], 201);
    }

    public function update(Request $request, $customerConcern)
    {
        $user = $request->user();
        if (!$user || !method_exists($user, 'isAdmin') || !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,resolved',
            'admin_reply' => 'nullable|string|max:5000',
        ]);

        $concern = CustomerConcern::find($customerConcern);
        if (!$concern) {
            return response()->json(['message' => 'Concern not found'], 404);
        }

        $payload = [
            'status' => $validated['status'],
        ];

        if (array_key_exists('admin_reply', $validated)) {
            $payload['admin_reply'] = $validated['admin_reply'];
            if (!empty($validated['admin_reply'])) {
                $payload['replied_at'] = now();
            }
        }

        $concern->update($payload);

        return response()->json([
            'message' => 'Concern updated successfully',
            'data' => $concern->fresh(),
        ]);
    }
}
