<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\EmployeeDocument;
use Illuminate\Support\Facades\Storage;

class EmployeeDocumentController extends Controller
{
    // GET /hr/employees/{id}/documents
    public function index($employeeId)
    {
        return response()->json(EmployeeDocument::where('employee_id', $employeeId)->get());
    }

    // POST /hr/employees/{id}/documents
    public function store(Request $request, $employeeId)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'file'        => 'required|file|max:5120', // Max 5MB
            'type'        => 'nullable|string',
            'expiry_date' => 'nullable|date',
        ]);

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store("employees/{$employeeId}/documents", 'public');
            
            $doc = EmployeeDocument::create([
                'employee_id' => $employeeId,
                'title'       => $validated['title'],
                'file_path'   => $path,
                'type'        => $validated['type'],
                'expiry_date' => $validated['expiry_date'],
            ]);

            return response()->json($doc, 201);
        }

        return response()->json(['message' => 'File not found'], 400);
    }

    // DELETE /hr/documents/{id}
    public function destroy($id)
    {
        $doc = EmployeeDocument::findOrFail($id);
        Storage::disk('public')->delete($doc->file_path);
        $doc->delete();

        return response()->json(['message' => 'Document deleted']);
    }
}
