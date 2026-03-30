<?php

namespace App\Http\Controllers\Email;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EmailAccount;
use App\Models\Employee;
use Illuminate\Support\Facades\Hash;

class EmailAccountController extends Controller
{
    public function index()
    {
        return response()->json([
            'accounts' => EmailAccount::with('employee')->get(),
            'unassigned_employees' => Employee::whereDoesntHave('emailAccount')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'email'       => 'required|email|unique:email_accounts,email',
            'password'    => 'required|string|min:6',
            'quota_gb'    => 'required|numeric|min:0.1'
        ]);

        $domain = 'ecopacpowertech.com';
        
        $account = EmailAccount::create([
            'employee_id'   => $validated['employee_id'],
            'email'         => $validated['email'],
            'password_hash' => Hash::make($validated['password']),
            'mailbox_path'  => "/var/mail/vhosts/{$domain}/" . str_replace('@' . $domain, '', $validated['email']),
            'quota_gb'      => $validated['quota_gb'],
            'is_active'     => true
        ]);

        return response()->json($account, 201);
    }

    public function show($id)
    {
        return response()->json(EmailAccount::with(['employee', 'logs'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $account = EmailAccount::findOrFail($id);
        $validated = $request->validate([
            'is_active' => 'sometimes|boolean',
            'quota_gb'  => 'sometimes|numeric|min:0.1',
            'password'  => 'sometimes|string|min:6'
        ]);

        if (isset($validated['password'])) {
            $validated['password_hash'] = Hash::make($validated['password']);
            unset($validated['password']);
        }

        $account->update($validated);
        return response()->json($account);
    }

    public function sync(Request $request)
    {
        // Manual sync for all employees who don't have email accounts
        $employees = Employee::whereDoesntHave('emailAccount')->get();
        $count = 0;

        foreach ($employees as $employee) {
            $domain = 'ecopacpowertech.com';
            $email  = strtolower($employee->first_name . '.' . $employee->last_name) . '@' . $domain;
            
            if (EmailAccount::where('email', $email)->exists()) {
                $email = strtolower($employee->first_name . '.' . $employee->last_name . $employee->id) . '@' . $domain;
            }

            $employee->emailAccount()->create([
                'email'         => $email,
                'password_hash' => $employee->password ?? Hash::make('Ecopac@2026'),
                'mailbox_path'  => "/var/mail/vhosts/{$domain}/" . str_replace('@' . $domain, '', $email),
                'quota_gb'      => 5.00,
            ]);
            $count++;
        }

        return response()->json(['message' => "Synced $count email accounts."]);
    }

    public function destroy($id)
    {
        $account = EmailAccount::findOrFail($id);
        $account->delete();
        return response()->json(['message' => 'Email account deleted.']);
    }
}
