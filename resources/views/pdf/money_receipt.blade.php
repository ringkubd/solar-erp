<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Money Receipt {{ $receipt->receipt_no }}</title>
    <style>
        @page { margin: 0; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; color: #1e293b; background: #fff; line-height: 1.5; }
        
        .receipt-container { width: 100%; height: 100%; padding: 40px; position: relative; }
        
        /* Corporate Accent */
        .accent-bar { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #059669 0%, #10b981 100%); }

        .header { display: table; width: 100%; margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; }
        .header-left { display: table-cell; vertical-align: middle; }
        .header-right { display: table-cell; vertical-align: middle; text-align: right; }

        .brand-name { font-size: 24px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
        .brand-sub  { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
        
        .receipt-label { font-size: 28px; font-weight: 800; color: #f1f5f9; letter-spacing: 4px; text-transform: uppercase; line-height: 1; }
        .receipt-no { font-size: 14px; font-weight: 700; color: #059669; margin-top: 5px; font-family: monospace; }

        .info-grid { display: table; width: 100%; border-collapse: separate; border-spacing: 0 15px; }
        .info-row { display: table-row; }
        .info-cell { display: table-cell; vertical-align: top; }
        
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; }
        .card-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
        .card-value { font-size: 13px; font-weight: 700; color: #0f172a; }
        .card-sub   { font-size: 11px; color: #64748b; margin-top: 2px; }

        .amount-section { background: #0f172a; color: #fff; border-radius: 12px; padding: 25px; margin-top: 10px; text-align: center; }
        .amount-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; }
        .amount-value { font-size: 36px; font-weight: 900; font-family: monospace; color: #10b981; }
        .amount-words { font-size: 10px; font-style: italic; color: #94a3b8; margin-top: 5px; text-transform: capitalize; }
        
        .details-table { width: 100%; margin-top: 25px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; border-collapse: collapse; }
        .details-table th { background: #f8fafc; padding: 12px 15px; text-align: left; font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .details-table td { padding: 12px 15px; font-size: 12px; font-weight: 600; border-bottom: 1px solid #f1f5f9; }

        .discount-badge { display: inline-block; background: #ecfdf5; color: #059669; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; border: 1px solid #10b981; margin-top: 15px; }

        .footer { position: absolute; bottom: 40px; left: 40px; right: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
        .footer-text { font-size: 9px; color: #94a3b8; display: table; width: 100%; }
        .footer-left { display: table-cell; }
        .footer-right { display: table-cell; text-align: right; }

        .stamp-box { position: absolute; top: 120px; right: 60px; width: 100px; height: 100px; border: 3px solid #059669; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(15deg); opacity: 0.15; pointer-events: none; }
        .stamp-text { font-size: 14px; font-weight: 900; color: #059669; text-align: center; line-height: 1; text-transform: uppercase; }
        
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: 900; color: #f1f5f9; z-index: -1; pointer-events: none; text-transform: uppercase; white-space: nowrap; }
    </style>
</head>
<body>
    <div class="accent-bar"></div>
    <div class="receipt-container">
        <div class="watermark">OFFICIAL RECEIPT</div>

        <div class="header">
            <div class="header-left">
                <div class="brand-name">ECOPAC</div>
                <div class="brand-sub">Power and Technology Limited</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 5px;">📍 Dhaka, Bangladesh | 📞 +880 000 000 0000 | ✉ info@ecopac.com.bd</div>
            </div>
            <div class="header-right">
                <div class="receipt-label">RECEIPT</div>
                <div class="receipt-no">NO: {{ $receipt->receipt_no }}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-row">
                <div class="info-cell" style="width: 60%; padding-right: 20px;">
                    <div class="card">
                        <div class="card-label">Received From</div>
                        <div class="card-value">{{ $receipt->client->company_name ?? 'Valued Client' }}</div>
                        <div class="card-sub">{{ $receipt->client->site_address ?? $receipt->client->billing_address ?? 'Bangladesh' }}</div>
                        <div class="card-sub">Ref: {{ $receipt->invoice ? 'Invoice #'.$receipt->invoice->invoice_no : 'General Payment' }}</div>
                    </div>
                </div>
                <div class="info-cell" style="width: 40%;">
                    <div class="card">
                        <div class="card-label">Receipt Details</div>
                        <div class="card-value">{{ \Carbon\Carbon::parse($receipt->receipt_date)->format('d F, Y') }}</div>
                        <div class="card-sub">Method: {{ str_replace('_', ' ', ucfirst($receipt->payment_method)) }}</div>
                        <div class="card-sub">TxID: {{ $receipt->transaction_ref ?? '—' }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="amount-section">
            <div class="amount-label">Verified Payment Amount</div>
            <div class="amount-value">৳ {{ number_format($receipt->amount, 2) }}</div>
            <div class="amount-words">Amount in words: {{ $receipt->amount_in_words ?? 'Calculated at settlement' }} BDT</div>
        </div>

        @if($receipt->discount_amount > 0)
        <div class="discount-badge">
            ✓ SETTLEMENT DISCOUNT APPLIED: ৳ {{ number_format($receipt->discount_amount, 2) }}
        </div>
        @endif

        <table class="details-table">
            <thead>
                <tr>
                    <th>Particulars / Description</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Payment for {{ $receipt->invoice ? 'Invoice '.$receipt->invoice->invoice_no : 'Account Settlement' }}</td>
                    <td style="text-align: right;">৳ {{ number_format($receipt->amount, 2) }}</td>
                </tr>
                @if($receipt->discount_amount > 0)
                <tr>
                    <td style="color: #059669;">Less: Special Settlement Discount</td>
                    <td style="text-align: right; color: #059669;">- ৳ {{ number_format($receipt->discount_amount, 2) }}</td>
                </tr>
                @endif
            </tbody>
        </table>

        @if($receipt->notes)
        <div style="margin-top: 20px;">
            <div class="card-label">Notes / Instructions</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 5px;">{{ $receipt->notes }}</div>
        </div>
        @endif

        <div class="stamp-box">
            <div class="stamp-text">ECOPAC<br>PAID</div>
        </div>

        <div class="footer">
            <div class="footer-text">
                <div class="footer-left">
                    Authorized Signature & Seal Not Required | Computer Generated Document
                </div>
                <div class="footer-right">
                    Generated on {{ now()->format('d M Y, H:i') }} | Recorded by {{ $receipt->recorder->name ?? 'System' }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
