<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proposal;
use App\Models\Lead;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class ProposalController extends Controller
{
    public function index()
    {
        return response()->json(Proposal::with('lead', 'client')->orderByDesc('created_at')->get());
    }

    public function show($id)
    {
        $proposal = Proposal::with(['lead', 'client', 'specs', 'sections.items'])->findOrFail($id);
        return response()->json($proposal);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lead_id' => 'required|exists:leads,id',
            'template_type' => 'required|string',
            'title' => 'required|string|max:255',
        ]);

        $validated['proposal_no'] = 'PROP-' . strtoupper(Str::random(6));
        $validated['valid_until'] = now()->addDays(30);
        $validated['status'] = 'draft';

        $proposal = Proposal::create($validated);
        return response()->json($proposal, 201);
    }

    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'load_kw' => 'required|numeric',
            'budget_bdt' => 'nullable|numeric',
            'panel_watt' => 'nullable|numeric'
        ]);

        $loadKw = $validated['load_kw'];
        $panelWatt = $validated['panel_watt'] ?? 550;

        // Auto Calculations for standard Solar Rooftop
        $systemSizeKw = $loadKw * 1.25; // 25% safety margin
        $annualGenKwh = $systemSizeKw * 4.5 * 300; // 4.5 peak hours, 300 days
        $panelQty = ceil(($systemSizeKw * 1000) / $panelWatt);
        
        // ROI Calculation Estimation
        $monthlySavings = ($annualGenKwh / 12) * 10; // Assuming 10 BDT/kWh cost
        $estimatedCost = $systemSizeKw * 65000; // Assuming 65,000 BDT per kW installation
        $paybackYears = $monthlySavings > 0 ? $estimatedCost / ($monthlySavings * 12) : 0;
        $roiPct = $estimatedCost > 0 ? (($monthlySavings * 12) / $estimatedCost) * 100 : 0;

        return response()->json([
            'system_size_kw' => round($systemSizeKw, 2),
            'annual_gen_kwh' => round($annualGenKwh, 2),
            'panel_qty' => $panelQty,
            'panel_watt' => $panelWatt,
            'estimated_cost_bdt' => round($estimatedCost, 2),
            'monthly_savings_bdt' => round($monthlySavings, 2),
            'payback_years' => round($paybackYears, 2),
            'roi_pct' => round($roiPct, 2),
        ]);
    }

    public function autoFill($leadId)
    {
        $lead = Lead::with('siteSurveys', 'client')->findOrFail($leadId);
        
        $survey = $lead->siteSurveys->first();
        $baseLoad = $survey ? ($survey->available_roof_sqft / 100) : 50; // default 50kW if no survey
        
        return response()->json([
            'lead_id' => $lead->id,
            'client_id' => $lead->client_id ?? null,
            'title' => $lead->company_name . ' - Solar Proposal',
            'template_type' => 'solar_rooftop',
            'suggested_load_kw' => $baseLoad
        ]);
    }

    public function cloneVersion($id)
    {
        $original = Proposal::with(['specs', 'sections.items'])->findOrFail($id);
        
        $newProposal = $original->replicate();
        $newProposal->version = $original->version + 1;
        $newProposal->parent_id = $original->id;
        $newProposal->proposal_no = 'PROP-' . strtoupper(Str::random(6));
        $newProposal->status = 'draft';
        $newProposal->push();

        if ($original->specs) {
            $newSpecs = $original->specs->replicate();
            $newSpecs->proposal_id = $newProposal->id;
            $newSpecs->push();
        }

        foreach ($original->sections as $section) {
            $newSection = $section->replicate();
            $newSection->proposal_id = $newProposal->id;
            $newSection->push();

            foreach ($section->items as $item) {
                $newItem = $item->replicate();
                $newItem->section_id = $newSection->id;
                $newItem->push();
            }
        }

        return response()->json($newProposal->load(['specs', 'sections.items']), 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,viewed,accepted,rejected,expired'
        ]);

        $proposal = Proposal::findOrFail($id);
        $proposal->status = $validated['status'];
        
        if ($validated['status'] === 'sent') $proposal->sent_at = now();
        if ($validated['status'] === 'viewed') $proposal->viewed_at = now();
        if ($validated['status'] === 'accepted' || $validated['status'] === 'rejected') {
            $proposal->responded_at = now();
        }

        $proposal->save();

        if ($proposal->status === 'accepted') {
            event(new \App\Events\ProposalApproved($proposal));
        }

        return response()->json($proposal);
    }

    public function generatePdf($id)
    {
        $proposal = Proposal::with(['lead', 'client', 'specs', 'sections.items'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.proposal', compact('proposal'));
        return $pdf->download('proposal_'.$proposal->proposal_no.'.pdf');
    }
}
