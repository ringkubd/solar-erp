<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckGuard
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $guard): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // 1. Superadmin Bypass
        if ($user instanceof \App\Models\User && ($user->role === 'admin' || $user->email === 'ajr.jahid@gmail.com')) {
            return $next($request);
        }

        // 2. Exact Guard Check
        $allowed = false;
        if ($guard === 'employee' && $user instanceof \App\Models\Employee) {
            $allowed = true;
        } elseif ($guard === 'client' && $user instanceof \App\Models\Client) {
            $allowed = true;
        } elseif (($guard === 'web' || $guard === 'admin') && $user instanceof \App\Models\User) {
            $allowed = true;
        }

        if (!$allowed) {
            return response()->json(['message' => "Forbidden. Access restricted to {$guard} guard."], 403);
        }

        return $next($request);
    }
}
