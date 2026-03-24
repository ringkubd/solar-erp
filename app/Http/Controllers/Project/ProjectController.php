<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;

class ProjectController extends Controller
{
    public function index()
    {
        return response()->json(Project::with('client', 'tasks', 'siteSurveys')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_no' => 'required|string|unique:projects',
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:200',
            'type' => 'required|in:solar,substation,electrical,amc,other',
        ]);
        $project = Project::create($validated);
        return response()->json($project, 201);
    }

    public function show($id)
    {
        $project = Project::with([
            'client', 
            'phases.tasks.assignee',
            'tasks.dependency', 
            'tasks.assignee',
            'siteSurveys', 
            'expenses', 
            'materials', 
            'documents.uploader',
            'costs'
        ])->findOrFail($id);
        
        return response()->json($project);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);
        $project->update($request->all());
        return response()->json($project);
    }

    public function gantt($id)
    {
        // Fetch tasks mapped for Gantt charting
        $tasks = \App\Models\ProjectTask::where('project_id', $id)
                    ->with('dependency')
                    ->orderBy('start_date', 'asc')
                    ->get();
                    
        return response()->json($tasks);
    }

    public function profitability($id)
    {
        $project = Project::findOrFail($id);
        
        // Compute metrics
        $budget = $project->budget ?? 0;
        
        $materialExpenses = $project->expenses()->where('category', 'material')->sum('amount');
        $laborExpenses = $project->expenses()->where('category', 'labor')->sum('amount');
        $otherExpenses = $project->expenses()->whereIn('category', ['logistics', 'other'])->sum('amount');
        
        $totalCost = $materialExpenses + $laborExpenses + $otherExpenses;
        $profit = $budget - $totalCost;
        $marginPct = $budget > 0 ? ($profit / $budget) * 100 : 0;

        return response()->json([
            'budget' => $budget,
            'costs' => [
                'material' => $materialExpenses,
                'labor' => $laborExpenses,
                'other' => $otherExpenses,
                'total' => $totalCost
            ],
            'profit' => $profit,
            'margin_percentage' => round($marginPct, 2)
        ]);
    }
}
