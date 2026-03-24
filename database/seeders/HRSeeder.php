<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Employee;

class HRSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Departments
        $deptData = [
            ['name' => 'Engineering', 'code' => 'ENG', 'desc' => 'Project design, site survey, and technical installation'],
            ['name' => 'Sales',       'code' => 'SLS', 'desc' => 'Lead generation and client relationships'],
            ['name' => 'Accounts',    'code' => 'ACC', 'desc' => 'Financial planning and bookkeeping'],
            ['name' => 'Operations',  'code' => 'OPS', 'desc' => 'Supply chain and logistics'],
        ];

        foreach ($deptData as $d) {
            $dept = Department::create([
                'name' => $d['name'],
                'code' => $d['code'],
                'description' => $d['desc']
            ]);

            // 2. Sample Employees
            if ($d['code'] === 'ENG') {
                Employee::create([
                    'department_id' => $dept->id,
                    'employee_id'   => 'ECO-001',
                    'first_name'    => 'Anwar',
                    'last_name'     => 'Hossain',
                    'email'         => 'anwar@ecopac.com',
                    'phone'         => '01711223344',
                    'role'          => 'Senior Engineer',
                    'salary'        => 85000,
                    'join_date'     => '2024-01-10',
                    'status'        => 'active'
                ]);
            }

            if ($d['code'] === 'SLS') {
                Employee::create([
                    'department_id' => $dept->id,
                    'employee_id'   => 'ECO-005',
                    'first_name'    => 'Sarah',
                    'last_name'     => 'Ahmed',
                    'email'         => 'sarah@ecopac.com',
                    'phone'         => '01811223344',
                    'role'          => 'Sales Manager',
                    'salary'        => 65000,
                    'join_date'     => '2024-02-15',
                    'status'        => 'active'
                ]);
            }
        }
    }
}
