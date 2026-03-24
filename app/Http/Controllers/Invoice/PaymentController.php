<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Invoice;

class PaymentController extends Controller
{
    public function store(Request $request, $invoiceId)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'client_id' => 'required|exists:clients,id'
        ]);
        
        $invoice = Invoice::findOrFail($invoiceId);
        $validated['invoice_id'] = $invoiceId;
        
        $payment = Payment::create($validated);
        
        // Update Invoice Amount Paid
        $invoice->amount_paid += $payment->amount;
        if ($invoice->amount_paid >= $invoice->total_amount) {
            $invoice->status = 'paid';
        } else {
            $invoice->status = 'partially_paid';
        }
        $invoice->save();

        return response()->json($payment, 201);
    }
}
