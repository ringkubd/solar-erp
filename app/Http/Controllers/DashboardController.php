<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\Project;
use App\Models\Lead;
use App\Models\Proposal;

class DashboardController extends Controller
{
    public function stats()
    {
        // 1. CRM Metrics
        $leadsByStage = Lead::selectRaw('stage, count(*) as count')->groupBy('stage')->get()->pluck('count', 'stage');
        
        // 2. Project Metrics
        $activeProjects = Project::whereIn('status', ['planning', 'active'])
            ->withCount('tasks')
            ->orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'progress' => $p->progress_pct ?? 0,
                    'status' => $p->status,
                    'tasks_count' => $p->tasks_count
                ];
            });

        // 3. Accounting Metrics (using Service)
        $accounting = app(\App\Services\AccountingService::class)->dashboardStats();

        // 4. Counts
        return response()->json([
            'counts' => [
                'total_revenue' => $accounting['kpis']['total_revenue'],
                'net_profit' => $accounting['kpis']['net_profit'],
                'active_projects' => Project::whereIn('status', ['planning', 'active'])->count(),
                'new_leads' => Lead::where('stage', 'new')->count(),
                'pending_proposals' => Proposal::whereIn('status', ['sent', 'draft'])->count(),
            ],
            'funnel' => [
                'new' => $leadsByStage['new'] ?? 0,
                'contacted' => $leadsByStage['contacted'] ?? 0,
                'proposal' => $leadsByStage['proposal'] ?? 0,
                'won' => $leadsByStage['won'] ?? 0,
            ],
            'projects' => $activeProjects,
            'recent_finance' => $accounting['recent_journals'],
            'trends' => $accounting['trends']
        ]);
    }
}
