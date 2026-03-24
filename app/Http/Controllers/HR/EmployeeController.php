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
            'user_id'         => 'nullable|exists:users,id',
            'employee_id'     => 'required|string|unique:employees,employee_id',
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'email'           => 'required|email|unique:employees,email',
            'phone'           => 'nullable|string',
            'role'            => 'required|string', 
            'salary'          => 'required|numeric|min:0',
            'salary_structure' => 'nullable|array',
            'join_date'       => 'required|date',
            'address'         => 'nullable|string',
        ]);

        return response()->json(Employee::create($validated), 201);
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
            'department_id' => 'sometimes|required|exists:departments,id',
            'first_name'    => 'sometimes|required|string|max:100',
            'last_name'     => 'sometimes|required|string|max:100',
            'email'         => "sometimes|required|email|unique:employees,email,{$id}",
            'status'        => 'sometimes|required|in:active,inactive,on_leave',
            'salary'        => 'sometimes|required|numeric',
        ]);

        $employee->update($validated);
        return response()->json($employee);
    }
}
