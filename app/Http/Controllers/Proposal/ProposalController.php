<?php

namespace App\Http\Controllers\Proposal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proposal;
use Barryvdh\DomPDF\Facade\Pdf;
class ProposalController extends Controller
{
    public function index()
    {
        return response()->json(Proposal::with(['items', 'sections', 'solarSpecs'])->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'proposal_no' => 'required|string|unique:proposals',
            'lead_id' => 'required|exists:leads,id',
            'template_type' => 'required|in:solar_rooftop,industrial_solar,substation,electrical,amc',
            'title' => 'required|string',
            'valid_until' => 'required|date',
            'status' => 'nullable|string',
            'subtotal' => 'numeric',
            'total_amount' => 'numeric',
        ]);

        $proposal = Proposal::create($validated);
        
        return response()->json($proposal, 201);
    }

    public function show($id)
    {
        $proposal = Proposal::with(['items', 'sections', 'solarSpecs'])->findOrFail($id);
        return response()->json($proposal);
    }

    public function update(Request $request, $id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->update($request->all());
        return response()->json($proposal);
    }

    public function destroy($id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->delete();
        return response()->json(null, 204);
    }

    public function generatePdf($id)
    {
        $proposal = Proposal::with(['items', 'sections', 'solarSpecs'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.proposal', compact('proposal'));
        return $pdf->download('proposal_'.$proposal->proposal_no.'.pdf');
    }
}
