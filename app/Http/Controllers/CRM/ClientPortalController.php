<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Project;

class ClientPortalController extends Controller
{
    public function dashboard(Request $request)
    {
        $client = $request->user();
        
        $projects = Project::where('client_id', $client->id)
            ->with(['phases' => function($q) {
                $q->orderBy('order');
            }])
            ->get();

        $invoices = Invoice::where('client_id', $client->id)->get();
        
        $totalBilled = $invoices->sum('total_amount');
        $totalPaid = $invoices->sum('paid_amount'); // Assuming paid_amount exists or calculate from payments

        return response()->json([
            'client' => $client,
            'summary' => [
                'total_projects' => $projects->count(),
                'active_projects' => $projects->whereIn('status', ['active', 'in_progress'])->count(),
                'pending_payment' => $totalBilled - $totalPaid,
            ],
            'projects' => $projects->map(function($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'status' => $p->status,
                    'progress' => $p->progress ?? 0,
                    'next_milestone' => $p->phases->where('status', '!=', 'completed')->first()->name ?? 'N/A'
                ];
            })
        ]);
    }

    public function invoices(Request $request)
    {
        $client = $request->user();
        return response()->json(
            Invoice::where('client_id', $client->id)
                ->orderByDesc('issue_date')
                ->paginate(20)
        );
    }

    public function projectDetails(Request $request, $id)
    {
        $client = $request->user();
        $project = Project::where('client_id', $client->id)
            ->with(['phases', 'documents' => function($q) {
                // Only show documents marked as 'client_visible' if we had that field
                // For now, show all
            }])
            ->findOrFail($id);
            
        return response()->json($project);
    }
}
