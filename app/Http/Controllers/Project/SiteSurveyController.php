<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SiteSurvey;

class SiteSurveyController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'scheduled_date' => 'required|date',
            'project_id' => 'required|exists:projects,id'
        ]);
        $survey = SiteSurvey::create($validated);
        return response()->json($survey, 201);
    }
}
