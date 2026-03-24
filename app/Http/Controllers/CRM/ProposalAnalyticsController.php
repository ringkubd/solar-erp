<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proposal;
use Carbon\Carbon;

class ProposalAnalyticsController extends Controller
{
    public function getDealFlow()
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $totalProposals = Proposal::count();
        $totalSent = Proposal::whereIn('status', ['sent', 'viewed', 'accepted', 'rejected'])->count();
        $totalAccepted = Proposal::where('status', 'accepted')->count();
        $totalRejected = Proposal::where('status', 'rejected')->count();

        // Conversion Rate (Accepted / Sent)
        $conversionRate = $totalSent > 0 ? round(($totalAccepted / $totalSent) * 100, 1) : 0;

        // Pipeline Value (Sum of total_amount for active/sent proposals)
        $pipelineValue = Proposal::whereIn('status', ['draft', 'sent', 'viewed'])->sum('total_amount');
        $wonValue = Proposal::where('status', 'accepted')->sum('total_amount');

        // Recent Proposals List
        $recentProposals = Proposal::with(['client', 'lead'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'metrics' => [
                'total_proposals' => $totalProposals,
                'sent_proposals' => $totalSent,
                'won_proposals' => $totalAccepted,
                'conversion_rate_pct' => $conversionRate,
                'pipeline_value_bdt' => $pipelineValue,
                'won_value_bdt' => $wonValue
            ],
            'recent' => $recentProposals
        ]);
    }
}
