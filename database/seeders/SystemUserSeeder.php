<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use App\Models\Client;
use App\Models\EmployeeRole;
use Illuminate\Support\Facades\Hash;

class SystemUserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin (Web Guard)
        $admin = User::updateOrCreate(
            ['email' => 'ajr.jahid@gmail.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('ajr.jahid@gmail.com'),
            ]
        );

        Employee::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'employee_id' => 'SYS-ADMIN-01',
                'email' => 'admin@ecopacpowertech.com',
                'password' => Hash::make('ajr.jahid@gmail.com'),
                'department_id' => 1,
                'is_active' => true,
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 2. Employee (Employee Guard - All Access)
        $employee = Employee::updateOrCreate(
            ['email' => 'nayeem@ecopacpowertech.com'],
            [
                'first_name' => 'Nayeem',
                'last_name' => 'Admin',
                'employee_id' => 'ECO-ADMIN-00', // Unique System ID
                'email' => 'nayeem@ecopacpowertech.com',
                'password' => Hash::make('email'), // Requested password
                'department_id' => 1, // Engineering
                'is_active' => true,
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // Assign all-access permissions in EmployeeRole
        EmployeeRole::updateOrCreate(
            ['employee_id' => $employee->id, 'role_name' => 'admin'],
            [
                'permissions' => ['*'], // All access
            ]
        );

        // 3. Client (Client Guard)
        Client::updateOrCreate(
            ['email' => 'client@ecopacpowertech.com'],
            [
                'company_name' => 'EcoPac Client',
                'password' => Hash::make('emaik'), // Requested password (emaik)
                'is_active' => true,
            ]
        );
    }
}
