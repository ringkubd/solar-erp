<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Department;

class EmployeeController extends Controller
{
    // GET /employees
    public function index(Request $request)
    {
        $query = Employee::with(['department', 'designation', 'user'])->orderBy('first_name');

        if ($request->filled('department_id')) $query->where('department_id', $request->department_id);
        if ($request->filled('designation_id')) $query->where('designation_id', $request->designation_id);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function($q) use ($s) {
                $q->where('first_name', 'like', "%$s%")
                  ->orWhere('last_name', 'like', "%$s%")
                  ->orWhere('employee_id', 'like', "%$s%");
            });
        }

        return response()->json($query->paginate(20));
    }

    // GET /departments
    public function departments()
    {
        return response()->json(Department::withCount('employees')->get());
    }

    // GET /designations
    public function designations()
    {
        return response()->json(\App\Models\Designation::with('department')->get());
    }

    // POST /employees
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id'   => 'required|exists:departments,id',
            'designation_id'  => 'nullable|exists:designations,id',
            'employee_id'     => 'required|string|unique:employees,employee_id',
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'required|email|unique:employees,email',
            'password'        => 'required|string|min:6',
            'phone'           => 'nullable|string',
            'role'            => 'required|string', 
            'salary'          => 'required|numeric|min:0',
            'join_date'       => 'required|date',
            'address'         => 'nullable|string',
            'assigned_roles'  => 'nullable|array'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $employee = Employee::create($validated);

        if (isset($validated['assigned_roles'])) {
            foreach ($validated['assigned_roles'] as $roleName) {
                $employee->roles()->create(['role_name' => $roleName, 'permissions' => ['*']]);
            }
        }

        return response()->json($employee, 201);
    }

    // GET /employees/{id}
    public function show($id)
    {
        return response()->json(Employee::with(['department', 'designation', 'user', 'documents'])->findOrFail($id));
    }

    // PUT /employees/{id}
    public function update(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $validated = $request->validate([
            'first_name'     => 'sometimes|required|string|max:100',
            'last_name'      => 'sometimes|required|string|max:100',
            'email'          => "sometimes|required|email|unique:employees,email,{$id}",
            'phone'          => 'nullable|string',
            'employee_id'    => "sometimes|required|string|unique:employees,employee_id,{$id}",
            'department_id'  => 'sometimes|required|exists:departments,id',
            'designation_id' => 'sometimes|nullable|exists:designations,id',
            'join_date'      => 'sometimes|required|date',
            'role'           => 'sometimes|required|string',
            'salary'         => 'sometimes|required|numeric|min:0',
            'status'         => 'sometimes|required|in:active,inactive,on_leave',
            'is_active'      => 'sometimes|boolean',
            'address'        => 'nullable|string',
            'assigned_roles' => 'nullable|array'
        ]);

        $employee->update($validated);

        if ($request->has('assigned_roles')) {
            $employee->roles()->delete();
            foreach ($request->assigned_roles as $roleName) {
                $employee->roles()->create(['role_name' => $roleName, 'permissions' => ['*']]);
            }
        }

        return response()->json($employee->load('roles'));
    }

    public function updatePassword(Request $request, $id)
    {
        $employee = Employee::findOrFail($id);
        $request->validate(['password' => 'required|string|min:6']);
        
        $employee->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
        return response()->json(['message' => 'Password updated successfully']);
    }
}
