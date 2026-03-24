<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    /**
     * Create an invoice with items atomically.
     */
    public function create(array $data): Invoice
    {
        return DB::transaction(function () use ($data) {
            $items = $data['items'] ?? [];
            unset($data['items']);

            $invoice = Invoice::create($data);

            foreach ($items as $i => $item) {
                $invoice->items()->create(array_merge($item, ['sort_order' => $i]));
            }

            $invoice->load('items');
            $invoice->recalculateTotals();
            $invoice->save();

            return $invoice->fresh(['items', 'client', 'project', 'payments']);
        });
    }

    /**
     * Update invoice header + replace line items atomically.
     */
    public function update(Invoice $invoice, array $data): Invoice
    {
        return DB::transaction(function () use ($invoice, $data) {
            $items = $data['items'] ?? null;
            unset($data['items']);

            $invoice->update($data);

            if ($items !== null) {
                $invoice->items()->delete();
                foreach ($items as $i => $item) {
                    $invoice->items()->create(array_merge($item, ['sort_order' => $i]));
                }
            }

            $invoice->load('items');
            $invoice->recalculateTotals();
            $invoice->save();

            return $invoice->fresh(['items', 'client', 'project', 'payments']);
        });
    }

    /**
     * Auto-draft an invoice from a project phase milestone.
     */
    public function draftFromMilestone(int $projectId, int $phaseId): Invoice
    {
        return DB::transaction(function () use ($projectId, $phaseId) {
            $phase   = \App\Models\ProjectPhase::with('project.client')->findOrFail($phaseId);
            $project = $phase->project;

            $invoice = Invoice::create([
                'client_id'    => $project->client_id,
                'project_id'   => $projectId,
                'milestone_id' => $phaseId,
                'billing_type' => 'milestone',
                'issue_date'   => now()->toDateString(),
                'due_date'     => now()->addDays(30)->toDateString(),
                'status'       => 'draft',
            ]);

            // Pull from project cost entries if any exist
            $costs = \App\Models\ProjectCost::where('project_id', $projectId)
                ->whereNull('invoice_id')
                ->get();

            if ($costs->count() > 0) {
                foreach ($costs as $i => $cost) {
                    $invoice->items()->create([
                        'description' => $cost->description ?: ucfirst($cost->type) . ' - ' . $phase->name,
                        'item_type'   => $cost->type === 'material' ? 'material' : 'service',
                        'qty'         => 1,
                        'unit_price'  => $cost->estimated_amount ?? 0,
                        'sort_order'  => $i,
                    ]);
                }
            } else {
                $invoice->items()->create([
                    'description' => 'Milestone Billing: ' . $phase->name,
                    'item_type'   => 'milestone',
                    'qty'         => 1,
                    'unit_price'  => $project->budget ?? 0,
                    'sort_order'  => 0,
                ]);
            }

            $invoice->load('items');
            $invoice->recalculateTotals();
            $invoice->save();

            return $invoice->fresh(['items', 'client', 'project', 'milestone']);
        });
    }
}
