<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Money Receipt {{ $receipt->receipt_no }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 11px; color: #1a1a2e; background: #fff; padding: 24px 32px; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #047857; padding-bottom: 14px; margin-bottom: 14px; }
        .company { }
        .company-name { font-size: 18px; font-weight: 700; color: #047857; }
        .company-sub  { font-size: 9px; color: #666; margin-top: 3px; }
        .receipt-title { text-align: right; }
        .receipt-title h2 { font-size: 22px; font-weight: 900; color: #e5e7eb; letter-spacing: 2px; }
        .receipt-title .rno { font-size: 13px; font-weight: 700; color: #047857; margin-top: 2px; }

        .grid-2 { display: flex; gap: 20px; margin-top: 12px; }
        .card { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; }
        .card h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 4px; }
        .card p  { font-size: 11px; line-height: 1.5; }
        .card .name { font-weight: 700; font-size: 13px; }

        .amt-card { background: #047857; color: white; border-radius: 10px; text-align: center; padding: 14px 20px; flex-shrink: 0; min-width: 200px; }
        .amt-card .label { font-size: 9px; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.7; }
        .amt-card .amount { font-size: 28px; font-weight: 900; font-family: monospace; margin-top: 4px; }
        .amt-card .currency { font-size: 10px; opacity: 0.7; margin-top: 3px; }

        .details { margin-top: 14px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .detail-item h4 { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; margin-bottom: 2px; }
        .detail-item p  { font-weight: 600; font-size: 11px; }

        .invoice-ref { margin-top: 14px; padding: 10px 14px; border: 1.5px dashed #047857; border-radius: 8px; background: #f0fdf4; font-size: 10px; color: #15803d; }
        .invoice-ref strong { display: block; font-size: 11px; }

        .notes { margin-top: 12px; font-size: 10px; color: #6b7280; font-style: italic; }

        .footer { margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: #9ca3af; }

        .stamp { display: inline-block; border: 2.5px solid #15803d; color: #15803d; font-weight: 900; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 10px; border-radius: 4px; transform: rotate(-8deg); float: right; margin-top: -40px; }
    </style>
</head>
<body>

    <div class="header">
        <div class="company">
            <div class="company-name">ECOPAC</div>
            <div class="company-sub">Power and Technology Limited<br>📍 Dhaka, Bangladesh | 📞 +880 000-000-0000</div>
        </div>
        <div class="receipt-title">
            <h2>MONEY RECEIPT</h2>
            <div class="rno">{{ $receipt->receipt_no }}</div>
        </div>
    </div>

    <div class="stamp">RECEIVED</div>

    <div class="grid-2">
        <div class="card">
            <h4>Received From</h4>
            <p class="name">{{ $receipt->client->company_name ?? 'N/A' }}</p>
            <p>{{ $receipt->client->email ?? '' }}</p>
            <p>{{ $receipt->client->phone ?? '' }}</p>
        </div>

        <div class="amt-card">
            <div class="label">Amount Received</div>
            <div class="amount">{{ number_format($receipt->amount, 2) }}</div>
            <div class="currency">BDT — Bangladeshi Taka</div>
        </div>
    </div>

    <div class="details">
        <div class="detail-item">
            <h4>Receipt Date</h4>
            <p>{{ \Carbon\Carbon::parse($receipt->receipt_date)->format('d M Y') }}</p>
        </div>
        <div class="detail-item">
            <h4>Payment Method</h4>
            <p>{{ str_replace('_', ' ', ucfirst($receipt->payment_method)) }}</p>
        </div>
        <div class="detail-item">
            <h4>Reference / TxID</h4>
            <p>{{ $receipt->transaction_ref ?? '—' }}</p>
        </div>
        <div class="detail-item">
            <h4>Recorded By</h4>
            <p>{{ $receipt->recorder?->name ?? 'System' }}</p>
        </div>
    </div>

    @if($receipt->invoice)
    <div class="invoice-ref">
        <strong>Invoice Reference: {{ $receipt->invoice->invoice_no }}</strong>
        Invoice Total: {{ number_format($receipt->invoice->total_amount, 2) }} BDT &nbsp;&nbsp;|&nbsp;&nbsp;
        Remaining Balance: {{ number_format($receipt->invoice->balance_due ?? ($receipt->invoice->total_amount - $receipt->invoice->amount_paid), 2) }} BDT
    </div>
    @endif

    @if($receipt->notes)
    <div class="notes">Note: {{ $receipt->notes }}</div>
    @endif

    <div class="footer">
        <span>This is a computer-generated receipt and does not require a physical signature.</span>
        <span>Generated: {{ now()->format('d M Y, H:i') }}</span>
    </div>

</body>
</html>
