<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\LocalAuthTokenService;

class EnsureLocalAuth
{
    protected LocalAuthTokenService $tokenService;

    public function __construct(LocalAuthTokenService $tokenService)
    {
        $this->tokenService = $tokenService;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $user = $this->tokenService->resolveUserFromToken($token);

        if (!$user) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        auth()->setUser($user);

        return $next($request);
    }
}
