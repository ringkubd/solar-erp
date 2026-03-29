<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmployeeRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // 1. Superadmin/Admin Bypass (User model)
        if ($user instanceof \App\Models\User) {
            if ($user->role === 'admin' || $user->email === 'ajr.jahid@gmail.com') {
                return $next($request);
            }
            return response()->json(['message' => 'Forbidden. Admin access required.'], 403);
        }

        // 2. Employee Guard Checks
        if ($user instanceof \App\Models\Employee) {
            // General "admin" role for employees
            if ($user->role === 'admin') {
                return $next($request);
            }

            $employeeRoles = $user->roles->pluck('role_name')->toArray();
            
            // "admin" entry in roles relationship
            if (in_array('admin', $employeeRoles)) {
                return $next($request);
            }

            foreach ($roles as $role) {
                if (in_array($role, $employeeRoles)) {
                    return $next($request);
                }
            }

            return response()->json(['message' => 'Forbidden. Insufficient role permissions.'], 403);
        }

        return response()->json(['message' => 'Forbidden. Unauthorized guard for this resource.'], 403);
    }
}
