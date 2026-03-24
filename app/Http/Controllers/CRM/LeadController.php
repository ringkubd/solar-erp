<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Lead;

class LeadController extends Controller
{
    public function index()
    {
        return response()->json(Lead::with(['assignedUser', 'contacts'])->get());
    }

    public function pipeline()
    {
        $leads = Lead::with(['assignedUser', 'contacts'])->get();
        $pipeline = [
            'new' => [], 'contacted' => [], 'survey' => [], 
            'proposal_sent' => [], 'negotiation' => [], 'won' => [], 'lost' => []
        ];
        foreach($leads as $lead) {
            $pipeline[$lead->stage][] = $lead;
        }
        return response()->json($pipeline);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:150',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email',
            'project_type' => 'required|in:solar,substation,electrical,amc,other',
        ]);

        $lead = Lead::create($validated);
        return response()->json($lead, 201);
    }

    public function show($id)
    {
        return response()->json(Lead::with(['assignedUser', 'contacts', 'activities'])->findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);
        $lead->update($request->all());
        return response()->json($lead);
    }

    public function destroy($id)
    {
        $lead = Lead::findOrFail($id);
        $lead->delete();
        return response()->json(null, 204);
    }

    public function updateStage(Request $request, $id)
    {
        $lead = Lead::findOrFail($id);
        $oldStage = $lead->stage;
        $newStage = $request->input('stage');

        $lead->stage = $newStage;
        $lead->save();

        if ($oldStage !== $newStage) {
            \App\Models\LeadActivity::create([
                'lead_id' => $lead->id,
                'user_id' => auth()->check() ? auth()->id() : 1, // fallback
                'type' => 'stage_change',
                'note' => "Stage changed from {$oldStage} to {$newStage}",
                'completed_at' => now()
            ]);
        }

        return response()->json($lead);
    }

    public function timeline($id)
    {
        $lead = Lead::findOrFail($id);
        $activities = \App\Models\LeadActivity::with('user')
                        ->where('lead_id', $lead->id)
                        ->orderBy('created_at', 'desc')
                        ->get();
        return response()->json($activities);
    }

    public function addActivity(Request $request, $id)
    {
        $validated = $request->validate([
            'type' => 'required|in:call,email,meeting,note,stage_change,reminder',
            'note' => 'nullable|string',
            'scheduled_at' => 'nullable|date',
            'completed_at' => 'nullable|date',
        ]);
        
        $validated['lead_id'] = $id;
        $validated['user_id'] = auth()->check() ? auth()->id() : 1;

        $activity = \App\Models\LeadActivity::create($validated);
        return response()->json($activity, 201);
    }

    public function storePublic(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:150',
            'phone' => 'required|string|max:30',
            'email' => 'nullable|email',
            'company_name' => 'nullable|string|max:150',
            'project_type' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);
        
        $validated['source'] = 'website';
        $validated['stage'] = 'new';
        
        $lead = Lead::create($validated);
        return response()->json(['message' => 'Thank you! Your request has been received.'], 201);
    }
}
