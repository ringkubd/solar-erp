<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $invoice->invoice_no }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #1a1a2e; background: #fff; }

        /* ---- Header ---- */
        .header { display: flex; justify-content: space-between; align-items: flex-start; padding: 28px 32px; border-bottom: 3px solid #047857; }
        .company-name { font-size: 22px; font-weight: 700; color: #047857; }
        .company-sub { font-size: 10px; color: #555; margin-top: 4px; }
        .invoice-title-block { text-align: right; }
        .invoice-title { font-size: 32px; font-weight: 700; color: #e5e7eb; letter-spacing: 2px; }
        .invoice-no { font-size: 14px; font-weight: 700; color: #047857; margin-top: 4px; }

        /* ---- Status Stamp ---- */
        .stamp { position: absolute; top: 80px; right: 32px; font-size: 20px; font-weight: 900; padding: 6px 16px; border-radius: 4px; letter-spacing: 2px; text-transform: uppercase; transform: rotate(-12deg); }
        .stamp-paid { color: #15803d; border: 3px solid #15803d; }
        .stamp-overdue { color: #dc2626; border: 3px solid #dc2626; }
        .stamp-draft { color: #9ca3af; border: 3px solid #9ca3af; }

        /* ---- Party Block ---- */
        .parties { display: flex; justify-content: space-between; padding: 24px 32px; gap: 16px; }
        .party h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 6px; }
        .party p { font-size: 12px; line-height: 1.6; }
        .party .name { font-weight: 700; font-size: 13px; color: #111827; }

        /* ---- Meta Dates ---- */
        .meta { display: flex; gap: 32px; padding: 0 32px 16px; }
        .meta-item h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 4px; }
        .meta-item p { font-weight: 600; font-size: 13px; }

        /* ---- Items Table ---- */
        .table-wrap { margin: 0 32px; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #047857; color: #fff; }
        thead th { padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
        tbody tr:nth-child(even) { background: #f9fafb; }
        tbody tr { border-bottom: 1px solid #e5e7eb; }
        tbody td { padding: 9px 12px; font-size: 11px; vertical-align: top; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .type-badge { display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 6px; border-radius: 3px; background: #e5e7eb; color: #374151; }

        /* ---- Totals ---- */
        .totals { margin: 16px 32px 0; display: flex; justify-content: flex-end; }
        .totals table { width: 300px; }
        .totals td { padding: 6px 12px; font-size: 12px; }
        .totals tr td:first-child { color: #6b7280; }
        .totals tr td:last-child { text-align: right; font-weight: 600; }
        .totals .total-row td { border-top: 2px solid #047857; font-size: 14px; color: #047857 !important; font-weight: 700 !important; padding-top: 10px; }
        .totals .balance-row td { font-size: 15px; font-weight: 900 !important; color: #111827 !important; }

        /* ---- Payments History ---- */
        .payments-section { margin: 24px 32px 0; }
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
        .payment-row { display: flex; justify-content: space-between; font-size: 11px; padding: 5px 0; border-bottom: 1px dotted #e5e7eb; }
        .payment-row .ref { color: #6b7280; }

        /* ---- Notes & Terms ---- */
        .bottom-section { display: flex; gap: 24px; margin: 24px 32px 0; }
        .notes-box { flex: 1; }
        .notes-box h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 6px; }
        .notes-box p { font-size: 11px; color: #4b5563; line-height: 1.6; }

        /* ---- Footer ---- */
        .footer { margin: 32px 32px 0; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <div>
            <div class="company-name">ECOPAC</div>
            <div class="company-sub">Power and Technology Limited<br>📍 Dhaka, Bangladesh | 📞 +880 000-000-0000 | ✉ info@ecopac.com.bd</div>
        </div>
        <div class="invoice-title-block">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-no">{{ $invoice->invoice_no }}</div>
        </div>
    </div>

    <!-- STATUS STAMP -->
    @if($invoice->status === 'paid')
        <div class="stamp stamp-paid">PAID</div>
    @elseif($invoice->status === 'overdue')
        <div class="stamp stamp-overdue">OVERDUE</div>
    @elseif($invoice->status === 'draft')
        <div class="stamp stamp-draft">DRAFT</div>
    @endif

    <!-- PARTIES -->
    <div class="parties">
        <div class="party">
            <h4>Bill To</h4>
            <p class="name">{{ $invoice->client->company_name ?? 'N/A' }}</p>
            <p>{{ $invoice->client->email ?? '' }}</p>
            <p>{{ $invoice->client->phone ?? '' }}</p>
        </div>
        @if($invoice->project)
        <div class="party">
            <h4>Project Reference</h4>
            <p class="name">{{ $invoice->project->name }}</p>
            <p>Ref: {{ $invoice->project->project_no }}</p>
            @if($invoice->milestone)
            <p>Milestone: {{ $invoice->milestone->name }}</p>
            @endif
        </div>
        @endif
        <div class="party" style="text-align:right">
            <h4>Payment Info</h4>
            <p>Currency: <strong>{{ $invoice->currency ?? 'BDT' }}</strong></p>
            <p>Billing: {{ ucfirst($invoice->billing_type) }}</p>
        </div>
    </div>

    <!-- META DATES -->
    <div class="meta">
        <div class="meta-item"><h4>Issue Date</h4><p>{{ \Carbon\Carbon::parse($invoice->issue_date)->format('d M Y') }}</p></div>
        <div class="meta-item"><h4>Due Date</h4><p>{{ \Carbon\Carbon::parse($invoice->due_date)->format('d M Y') }}</p></div>
        <div class="meta-item"><h4>Status</h4><p>{{ strtoupper(str_replace('_', ' ', $invoice->status)) }}</p></div>
    </div>

    <!-- LINE ITEMS TABLE -->
    <div class="table-wrap" style="margin-top:16px">
        <table>
            <thead>
                <tr>
                    <th style="width:40%">Description</th>
                    <th>Type</th>
                    <th class="text-center">Qty</th>
                    <th>Unit</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">VAT %</th>
                    <th class="text-right">VAT Amt</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @forelse($invoice->items as $item)
                <tr>
                    <td>{{ $item->description }}</td>
                    <td><span class="type-badge">{{ $item->item_type ?? 'service' }}</span></td>
                    <td class="text-center">{{ $item->qty }}</td>
                    <td>{{ $item->unit ?? '—' }}</td>
                    <td class="text-right">{{ number_format($item->unit_price, 2) }}</td>
                    <td class="text-right">{{ $item->vat_pct ?? 0 }}%</td>
                    <td class="text-right">{{ number_format($item->vat_amount ?? 0, 2) }}</td>
                    <td class="text-right"><strong>{{ number_format($item->total_price, 2) }}</strong></td>
                </tr>
                @empty
                <tr><td colspan="8" style="text-align:center; padding:20px; color:#9ca3af">No line items.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <!-- TOTALS -->
    <div class="totals">
        <table>
            <tr><td>Subtotal</td><td>{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
            @if($invoice->vat_amount > 0)
            <tr><td>VAT</td><td>{{ number_format($invoice->vat_amount, 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
            @endif
            @if($invoice->discount_amount > 0)
            <tr><td>Discount</td><td>- {{ number_format($invoice->discount_amount, 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
            @endif
            <tr class="total-row"><td>Total</td><td>{{ number_format($invoice->total_amount, 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
            <tr><td>Amount Paid</td><td>{{ number_format($invoice->amount_paid, 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
            <tr class="balance-row"><td>Balance Due</td><td>{{ number_format($invoice->balance_due ?? ($invoice->total_amount - $invoice->amount_paid), 2) }} {{ $invoice->currency ?? 'BDT' }}</td></tr>
        </table>
    </div>

    <!-- PAYMENT HISTORY -->
    @if($invoice->payments && $invoice->payments->count() > 0)
    <div class="payments-section">
        <div class="section-title">Payment History</div>
        @foreach($invoice->payments as $payment)
        <div class="payment-row">
            <span>{{ \Carbon\Carbon::parse($payment->payment_date)->format('d M Y') }} — {{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</span>
            <span class="ref">{{ $payment->transaction_ref ?? '' }}</span>
            <span><strong>{{ number_format($payment->amount, 2) }} {{ $invoice->currency ?? 'BDT' }}</strong></span>
        </div>
        @endforeach
    </div>
    @endif

    <!-- NOTES & TERMS -->
    <div class="bottom-section">
        @if($invoice->notes)
        <div class="notes-box">
            <h4>Notes</h4>
            <p>{{ $invoice->notes }}</p>
        </div>
        @endif
        @if($invoice->terms)
        <div class="notes-box">
            <h4>Terms & Conditions</h4>
            <p>{{ $invoice->terms }}</p>
        </div>
        @endif
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <span>ECOPAC Power and Technology Limited — www.ecopac.com.bd</span>
        <span>Generated: {{ now()->format('d M Y, H:i') }}</span>
    </div>

</body>
</html>
