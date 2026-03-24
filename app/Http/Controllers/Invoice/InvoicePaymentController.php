<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Invoice;
use App\Models\InvoicePayment;

class InvoicePaymentController extends Controller
{
    public function index($invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);
        return response()->json($invoice->payments()->with('recorder')->get());
    }

    public function store(Request $request, $invoiceId)
    {
        $invoice = Invoice::findOrFail($invoiceId);

        $validated = $request->validate([
            'amount'          => 'required|numeric|min:0.01',
            'payment_method'  => 'required|in:cash,bank_transfer,cheque,mobile_banking,other',
            'payment_date'    => 'required|date',
            'transaction_ref' => 'nullable|string|max:100',
            'reference_note'  => 'nullable|string',
        ]);

        $validated['invoice_id']  = $invoice->id;
        $validated['recorded_by'] = auth()->id();

        // Clamp payment to not exceed balance due
        $maxPayable = $invoice->balance_due > 0 ? $invoice->balance_due : $invoice->total_amount;
        if ($validated['amount'] > $maxPayable) {
            return response()->json(['message' => 'Payment amount exceeds the outstanding balance of ' . $maxPayable . ' BDT'], 422);
        }

        $payment = InvoicePayment::create($validated);

        return response()->json($payment->load('recorder'), 201);
    }

    public function destroy($invoiceId, $paymentId)
    {
        $payment = InvoicePayment::where('invoice_id', $invoiceId)->findOrFail($paymentId);
        $payment->delete();
        return response()->json(null, 204);
    }
}
