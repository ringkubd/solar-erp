<?php

namespace App\Listeners;

use App\Events\ProposalApproved;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CreateProjectFromProposal
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ProposalApproved $event): void
    {
        $proposal = $event->proposal;

        // Auto-create Project based on Proposal data
        if (!\App\Models\Project::where('proposal_id', $proposal->id)->exists()) {
            \App\Models\Project::create([
                'client_id'      => $proposal->client_id,
                'proposal_id'    => $proposal->id,
                'title'          => "Project: " . $proposal->title,
                'description'    => "Auto-generated from Approved Proposal {$proposal->proposal_no}",
                'status'         => 'planning',
                'start_date'     => now(),
                'budget'         => $proposal->total_amount ?? 0,
                'progress_pct'   => 0,
            ]);
        }
    }
}
