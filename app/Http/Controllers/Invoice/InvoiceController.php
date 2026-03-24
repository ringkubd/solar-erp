<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\AccountingService;

class InvoiceController extends Controller
{
    public function __construct(private InvoiceService $service, private AccountingService $accounting) {}


    public function index(Request $request)
    {
        $query = Invoice::with(['client', 'project'])
            ->withCount('items')
            ->withSum('payments', 'amount');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('project_id')) {
            $query->where('project_id', $request->project_id);
        }
        if ($request->filled('from')) {
            $query->whereDate('issue_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('issue_date', '<=', $request->to);
        }

        // Check & mark any invoices as overdue
        $query->each(fn($inv) => $inv->checkOverdue());

        return response()->json($query->orderByDesc('issue_date')->paginate(25));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id'       => 'required|exists:clients,id',
            'project_id'      => 'nullable|exists:projects,id',
            'milestone_id'    => 'nullable|exists:project_phases,id',
            'billing_type'    => 'required|in:item,milestone',
            'issue_date'      => 'required|date',
            'due_date'        => 'required|date|after_or_equal:issue_date',
            'currency'        => 'nullable|string|max:3',
            'tax_pct'         => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
            'notes'           => 'nullable|string',
            'terms'           => 'nullable|string',
            'items'           => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.item_type'   => 'nullable|string',
            'items.*.qty'         => 'required|numeric|min:0.01',
            'items.*.unit_price'  => 'required|numeric|min:0',
            'items.*.unit'        => 'nullable|string',
            'items.*.vat_pct'     => 'nullable|numeric|min:0|max:100',
            'items.*.discount_pct'=> 'nullable|numeric|min:0|max:100',
        ]);

        $validated['created_by'] = auth()->id();
        $invoice = $this->service->create($validated);

        return response()->json($invoice->load(['items', 'client', 'project', 'payments']), 201);
    }

    public function show($id)
    {
        $invoice = Invoice::with(['items', 'client', 'project', 'milestone', 'payments.recorder'])->findOrFail($id);
        $invoice->checkOverdue();
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'billing_type'    => 'sometimes|in:item,milestone',
            'issue_date'      => 'sometimes|date',
            'due_date'        => 'sometimes|date',
            'status'          => 'sometimes|in:draft,sent,paid,partially_paid,overdue,cancelled',
            'tax_pct'         => 'sometimes|numeric|min:0|max:100',
            'discount_amount' => 'sometimes|numeric|min:0',
            'notes'           => 'nullable|string',
            'terms'           => 'nullable|string',
            'items'           => 'sometimes|array',
            'items.*.description' => 'required_with:items|string',
            'items.*.qty'         => 'required_with:items|numeric|min:0.01',
            'items.*.unit_price'  => 'required_with:items|numeric|min:0',
            'items.*.vat_pct'     => 'nullable|numeric|min:0|max:100',
            'items.*.discount_pct'=> 'nullable|numeric|min:0|max:100',
        ]);

        $updated = $this->service->update($invoice, $validated);
        return response()->json($updated);
    }

    public function destroy($id)
    {
        Invoice::findOrFail($id)->delete();
        \App\Models\Journal::where('source', 'invoice')->where('source_id', $id)->delete();
        return response()->json(null, 204);
    }

    public function generatePdf($id)
    {
        $invoice = Invoice::with(['items', 'client', 'project', 'milestone', 'payments'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.invoice', compact('invoice'))
            ->setPaper('A4', 'portrait');
        return $pdf->download('Invoice_' . $invoice->invoice_no . '.pdf');
    }

    public function markSent($id)
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->updateQuietly(['status' => 'sent', 'sent_at' => now()]);

        // Auto-journalize invoice revenue & receivable if not already journalized
        $exists = \App\Models\Journal::where('source', 'invoice')->where('source_id', $invoice->id)->exists();
        if (!$exists) {
            event(new \App\Events\InvoiceCreated($invoice));
        }

        return response()->json($invoice);
    }

    public function draftFromMilestone(Request $request, $projectId, $phaseId)
    {
        $invoice = $this->service->draftFromMilestone($projectId, $phaseId);
        return response()->json($invoice, 201);
    }
}
