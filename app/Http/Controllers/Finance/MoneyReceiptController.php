<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\MoneyReceipt;
use App\Models\Invoice;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\AccountingService;

class MoneyReceiptController extends Controller
{
    public function __construct(private AccountingService $accounting) {}

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GET /receipts
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public function index(Request $request)
    {
        $query = MoneyReceipt::with(['client', 'invoice', 'recorder'])
            ->orderByDesc('receipt_date');

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }
        if ($request->filled('invoice_id')) {
            $query->where('invoice_id', $request->invoice_id);
        }
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }
        if ($request->filled('from')) {
            $query->whereDate('receipt_date', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('receipt_date', '<=', $request->to);
        }

        return response()->json($query->paginate(25));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  POST /receipts
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id'       => 'required|exists:clients,id',
            'invoice_id'      => 'nullable|exists:invoices,id',
            'amount'          => 'required|numeric|min:0.01',
            'payment_method'  => 'required|in:cash,bank_transfer,cheque,mobile_banking,other',
            'transaction_ref' => 'nullable|string|max:150',
            'receipt_date'    => 'required|date',
            'notes'           => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {

            // ── Overpayment Guard ──
            if (!empty($validated['invoice_id'])) {
                $invoice    = Invoice::findOrFail($validated['invoice_id']);
                $balanceDue = $invoice->balance_due > 0
                    ? $invoice->balance_due
                    : ($invoice->total_amount - $invoice->amount_paid);

                if ($validated['amount'] > $balanceDue + 0.001) {         // 0.001 float tolerance
                    return response()->json([
                        'message' => "Payment of ৳{$validated['amount']} exceeds the outstanding balance of ৳{$balanceDue}.",
                        'errors'  => ['amount' => ["Cannot exceed balance due of ৳" . number_format($balanceDue, 2)]],
                    ], 422);
                }

                // Make sure client matches invoice
                if ($invoice->client_id != $validated['client_id']) {
                    return response()->json([
                        'message' => 'The selected invoice does not belong to this client.',
                        'errors'  => ['invoice_id' => ['Invoice client mismatch.']],
                    ], 422);
                }
            }

            $validated['recorded_by'] = auth()->id();
            $receipt = MoneyReceipt::create($validated);

            // ── Auto Journalize Receipt via Event ──
            event(new \App\Events\PaymentReceived($receipt));

            // ── Update Invoice via InvoicePayment ledger ──
            if (!empty($validated['invoice_id'])) {
                \App\Models\InvoicePayment::create([
                    'invoice_id'     => $validated['invoice_id'],
                    'amount'         => $validated['amount'],
                    'payment_method' => $validated['payment_method'],
                    'transaction_ref'=> $validated['transaction_ref'] ?? null,
                    'payment_date'   => $validated['receipt_date'],
                    'reference_note' => "Auto-linked from Receipt #{$receipt->receipt_no}",
                    'recorded_by'    => auth()->id(),
                ]);
            }

            return response()->json($receipt->load(['client', 'invoice', 'recorder']), 201);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GET /receipts/{id}
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public function show($id)
    {
        return response()->json(
            MoneyReceipt::with(['client', 'invoice.items', 'recorder'])->findOrFail($id)
        );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  DELETE /receipts/{id}  (soft-delete + reverse invoice payment)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $receipt = MoneyReceipt::findOrFail($id);

            // Reverse the corresponding InvoicePayment entry if linked
            if ($receipt->invoice_id) {
                \App\Models\InvoicePayment::where('invoice_id', $receipt->invoice_id)
                    ->where('payment_date',  $receipt->receipt_date)
                    ->where('amount',        $receipt->amount)
                    ->where('recorded_by',   $receipt->recorded_by)
                    ->latest()
                    ->first()
                    ?->delete();
            }

            $receipt->delete();
            
            // Delete associated journal
            \App\Models\Journal::where('source', 'money_receipt')->where('source_id', $id)->delete();

            return response()->json(null, 204);
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  GET /receipts/{id}/pdf
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    public function pdf($id)
    {
        $receipt = MoneyReceipt::with(['client', 'invoice', 'recorder'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.money_receipt', compact('receipt'))
            ->setPaper([0, 0, 595, 420], 'landscape');   // A5-like receipt size
        return $pdf->download("Receipt_{$receipt->receipt_no}.pdf");
    }
}
