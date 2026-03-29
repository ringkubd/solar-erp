<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Employee;
use App\Models\Client;
use Illuminate\Support\Facades\Auth;

class MultiGuardAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
            'guard'    => 'required|in:web,admin,employee,client'
        ]);

        $guard = $request->guard;
        $model = match($guard) {
            'web', 'admin' => User::class,
            'employee'     => Employee::class,
            'client'       => Client::class,
        };

        $user = $model::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (isset($user->is_active) && !$user->is_active) {
            return response()->json(['message' => 'Account is inactive'], 403);
        }

        $tokenName = "{$guard}-token";
        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
            'guard' => $guard
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->loadMissing('roles');
        $guard = 'web';
        
        if ($user instanceof \App\Models\Employee) {
            $guard = 'employee';
        } elseif ($user instanceof \App\Models\Client) {
            $guard = 'client';
        }

        return response()->json([
            'user' => $user,
            'guard' => $guard
        ]);
    }

    public function registerClient(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email'        => 'required|email|unique:clients,email',
            'password'     => 'required|min:6|confirmed',
        ]);

        $client = Client::create([
            'company_name' => $validated['company_name'],
            'email'        => $validated['email'],
            'password'     => Hash::make($validated['password']),
            'is_active'    => true,
        ]);

        $token = $client->createToken('client-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $client,
            'guard' => 'client'
        ], 201);
    }
}
