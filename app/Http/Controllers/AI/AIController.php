<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function generateProposal(Request $request)
    {
        $validated = $request->validate([
            'load_kw' => 'required|numeric',
            'budget_bdt' => 'required|numeric',
            'type' => 'required|string',
        ]);

        $prompt = "Generate a brief JSON summary for a {$validated['type']} solar proposal. Client has {$validated['load_kw']}kW load requirement and {$validated['budget_bdt']} BDT budget. Return ONLY JSON with keys: system_size_kw, panel_qty, panel_watt, inverter_kw, payback_years, roi_pct, total_cost.";

        try {
            $response = Http::timeout(10)->post('http://localhost:11435/api/generate', [
                'model' => 'qwen3.5:4b',
                'prompt' => $prompt,
                'stream' => false,
                'format' => 'json'
            ]);

            if ($response->successful()) {
                $content = $response->json('response');
                
                // Clean potential markdown blocks from smaller models (like Qwen)
                $content = preg_replace('/```json\s*/i', '', $content);
                $content = preg_replace('/```\s*/', '', $content);
                $content = trim($content);
                
                $decoded = json_decode($content, true);
                
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return response()->json($decoded);
                }
                
                throw new \Exception("Invalid JSON format from AI");
            }
        } catch (\Exception $e) {
            // Mock fallback if Ollama is not alive
            return response()->json([
                'system_size_kw' => $validated['load_kw'] * 1.2,
                'panel_qty' => ceil(($validated['load_kw'] * 1200) / 550),
                'panel_watt' => 550,
                'inverter_kw' => $validated['load_kw'] * 1.1,
                'payback_years' => 4.5,
                'roi_pct' => 22.0,
                'total_cost' => $validated['budget_bdt'] * 0.95,
                'note' => 'Mocked AI response (Ollama offline).',
            ]);
        }

        return response()->json(['error' => 'AI Generation Failed'], 500);
    }

    public function generateFollowup($lead_id)
    {
        $lead = \App\Models\Lead::with('activities')->findOrFail($lead_id);
        
        $history = $lead->activities->take(5)->map(function($a) {
            return "[{$a->created_at}] {$a->type}: {$a->note}";
        })->implode("\n");

        $prompt = "Write a highly professional follow-up email to this client. Return ONLY the email body in Markdown, strictly in BOTH English and standard Bengali.
Client Name: {$lead->full_name}
Project Type: {$lead->project_type}
Recent History:\n{$history}";

        try {
            $response = Http::timeout(20)->post('http://localhost:11435/api/generate', [
                'model' => 'qwen3.5:4b',
                'prompt' => $prompt,
                'stream' => false,
            ]);

            if ($response->successful()) {
                return response()->json(['suggestion' => $response->json('response')]);
            }
        } catch (\Exception $e) {
            return response()->json(['suggestion' => "Dear {$lead->full_name},\n\nFollowing up on your {$lead->project_type} inquiry. Please let us know when you're available to discuss.\n\nপ্রিয় {$lead->full_name},\nআপনার {$lead->project_type} অনুসন্ধানের বিষয়ে ফলো-আপ করছি। বিস্তারিত আলোচনার জন্য অনুগ্রহ করে সময় জানাবেন।\n\n*(Fallback AI Outline)*"]);
        }

        return response()->json(['error' => 'AI Generation Failed'], 500);
    }

    public function suggestAction($lead_id)
    {
        $lead = \App\Models\Lead::with('activities')->findOrFail($lead_id);
        
        $history = $lead->activities->take(5)->map(function($a) {
            return "[{$a->created_at}] {$a->type}: {$a->note}";
        })->implode("\n");

        $prompt = "You are a sales CRM AI. Based on the client history: {$history}\nState the NEXT BEST ACTION the sales rep must take in exactly 1 short sentence.";

        try {
            $response = Http::timeout(15)->post('http://localhost:11435/api/generate', [
                'model' => 'qwen3.5:4b',
                'prompt' => $prompt,
                'stream' => false,
            ]);

            if ($response->successful()) {
                return response()->json(['action' => $response->json('response')]);
            }
        } catch (\Exception $e) {
            return response()->json(['action' => "Call the client to confirm project specifications."]);
        }

        return response()->json(['error' => 'AI Generation Failed'], 500);
    }

    public function projectRiskAnalysis($project_id)
    {
        $project = \App\Models\Project::with(['tasks', 'materials', 'expenses'])->findOrFail($project_id);
        
        $taskCount = $project->tasks->count();
        $completedTasks = $project->tasks->where('status', 'done')->count();
        $budget = $project->budget ?? 0;
        $expenses = $project->expenses->sum('amount');
        
        $prompt = "You are an AI Project Manager. Analyze this {$project->type} engineering project:
Project End Date: {$project->end_date}
Tasks: {$completedTasks} / {$taskCount} completed.
Budget: {$budget} BDT, Used: {$expenses} BDT.
Respond in JSON strictly with two keys:
1. 'risk_level': a string ('Low', 'Medium', 'High')
2. 'analysis': a 2-sentence executive summary of timeline/budget risks.";

        try {
            $response = Http::timeout(20)->post('http://localhost:11435/api/generate', [
                'model' => 'qwen3.5:4b',
                'prompt' => $prompt,
                'stream' => false,
                'format' => 'json'
            ]);

            if ($response->successful()) {
                $content = $response->json('response');
                
                $content = preg_replace('/```json\s*/i', '', $content);
                $content = preg_replace('/```\s*/', '', $content);
                $content = trim($content);

                $decoded = json_decode($content, true);
                
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    return response()->json($decoded);
                }
                throw new \Exception("Invalid JSON format from AI");
            }
        } catch (\Exception $e) {
            return response()->json([
                'risk_level' => 'Medium', 
                'analysis' => 'Unable to reach local AI container. Assuming standard operational risk based on current timeline.'
            ]);
        }
        
        return response()->json(['error' => 'AI Generation Failed'], 500);
    }
    
    public function predictProposalProbability($proposal_id)
    {
        $proposal = \App\Models\Proposal::with(['specs', 'lead.activities'])->findOrFail($proposal_id);
        
        $history = collect();
        if ($proposal->lead && $proposal->lead->activities) {
            $history = $proposal->lead->activities->take(5)->map(function($a) {
                return "[{$a->created_at}] {$a->type}: {$a->note}";
            });
        }
        $historyText = $history->isEmpty() ? "No prior interaction logs." : $history->implode("\n");
        
        $roi = $proposal->specs ? $proposal->specs->roi_pct : 'Unknown';
        $payback = $proposal->specs ? $proposal->specs->payback_years : 'Unknown';

        $prompt = "You are an AI Deal Flow Analyzer. Review this proposal deal:
Target ROI: {$roi}%
Payback Period: {$payback} Years
Total Value: {$proposal->total_amount} BDT
Client Interaction History:
{$historyText}

Based on this limited data, predict the Win Probability percentage and provide a 1-sentence analytical reason. 
Respond ONLY in JSON with two keys: 'probability_pct' (integer) and 'reasoning' (string).";

        try {
             $response = Http::timeout(20)->post('http://localhost:11435/api/generate', [
                'model' => 'qwen3.5:4b',
                'prompt' => $prompt,
                'stream' => false,
                'format' => 'json'
             ]);

             if ($response->successful()) {
                $content = $response->json('response');
                
                $content = preg_replace('/```json\s*/i', '', $content);
                $content = preg_replace('/```\s*/', '', $content);
                $content = trim($content);

                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                     return response()->json($decoded);
                }
             }
        } catch (\Exception $e) {
            // Fallback mock
        }

        return response()->json([
            'probability_pct' => 65,
            'reasoning' => 'Mock Analysis: Solid ROI numbers, but insufficient client interaction history to guarantee a win.'
        ]);
    }

    public function projectDiagnostics($id)
    {
        $project = \App\Models\Project::with(['phases.tasks', 'costs'])->findOrFail($id);

        $delayedTasks = $project->phases->flatMap->tasks->filter(fn($t) => $t->status === 'delayed');
        $budgetEstimated = $project->costs->sum('estimated_amount');
        $budgetActual    = $project->costs->sum('actual_amount');
        $overrunRisk     = $budgetEstimated > 0 ? (($budgetActual / $budgetEstimated) * 100) : 0;
        $progress        = $project->progress ?? 0;

        $context = "Project: {$project->name}. Type: {$project->type}. Progress: {$progress}%.
Delayed Tasks: {$delayedTasks->count()} tasks are delayed (e.g.: {$delayedTasks->pluck('title')->take(3)->join(', ')}).
Budget: Estimated " . number_format($budgetEstimated) . " BDT, Actual " . number_format($budgetActual) . " BDT (" . round($overrunRisk, 1) . "% spent).

Provide a JSON diagnosis with keys: delay_risk (low|medium|high), budget_status (on_track|at_risk|overrun), critical_tasks (array of strings), recommendations (array of strings), summary (string).";

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(30)->post('http://localhost:11435/api/generate', [
                'model'  => 'qwen3.5:4b',
                'prompt' => $context,
                'stream' => false,
            ]);

            if ($response->successful()) {
                $raw = $response->json('response');
                $raw = preg_replace('/```json\s*/i', '', $raw);
                $raw = preg_replace('/```\s*/', '', $raw);
                preg_match('/\{.*\}/s', $raw, $matches);
                if (!empty($matches[0])) {
                    $decoded = json_decode($matches[0], true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return response()->json($decoded);
                    }
                }
            }
        } catch (\Exception $e) {}

        return response()->json([
            'delay_risk'     => $delayedTasks->count() > 2 ? 'high' : ($delayedTasks->count() > 0 ? 'medium' : 'low'),
            'budget_status'  => $overrunRisk > 100 ? 'overrun' : ($overrunRisk > 80 ? 'at_risk' : 'on_track'),
            'critical_tasks' => $delayedTasks->pluck('title')->take(3)->values()->toArray(),
            'recommendations' => ['Review delayed tasks and update schedule.', 'Log actual cost entries to track budget accurately.'],
            'summary'        => "Project is {$progress}% complete with {$delayedTasks->count()} delayed tasks. Budget utilization at " . round($overrunRisk, 1) . "%.",
        ]);
    }
}
