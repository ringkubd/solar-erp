<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Proposal;
use App\Models\ProjectTask;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    /**
     * Create a project automatically from an approved proposal.
     */
    public function createFromProposal(Proposal $proposal): Project
    {
        return DB::transaction(function () use ($proposal) {
            // Check if project already exists for this proposal
            $existing = Project::where('proposal_id', $proposal->id)->first();
            if ($existing) return $existing;

            $project = Project::create([
                'client_id'      => $proposal->client_id,
                'proposal_id'    => $proposal->id,
                'title'          => "Project: " . ($proposal->title ?? $proposal->proposal_no),
                'description'    => "Automatically converted from Proposal #{$proposal->proposal_no}",
                'status'         => 'planning',
                'start_date'     => now(),
                'budget'         => $proposal->total_amount ?? 0,
                'progress_pct'   => 0,
            ]);

            // Optional: Copy scope items from proposal to tasks if applicable
            // For now, let's keep it simple.

            return $project;
        });
    }

    /**
     * Assign a task to a project.
     */
    public function createTask(int $projectId, array $data): ProjectTask
    {
        return DB::transaction(function () use ($projectId, $data) {
            $project = Project::findOrFail($projectId);
            
            return ProjectTask::create(array_merge($data, [
                'project_id' => $project->id,
            ]));
        });
    }

    /**
     * Update project progress based on tasks.
     */
    public function updateProgress(int $projectId): float
    {
        return DB::transaction(function () use ($projectId) {
            $project = Project::findOrFail($projectId);
            
            $tasks = $project->tasks;
            if ($tasks->isEmpty()) return 0;

            $completed = $tasks->where('status', 'completed')->count();
            $progress = ($completed / $tasks->count()) * 100;

            $project->update(['progress_pct' => $progress]);

            return $progress;
        });
    }
}
