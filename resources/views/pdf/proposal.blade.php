<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $proposal->title }}</title>
    <style>
        @page { margin: 40px; }
        body { font-family: 'Helvetica', sans-serif; font-size: 13px; color: #2d3748; line-height: 1.5; }
        .header { display: block; border-bottom: 3px solid #059669; padding-bottom: 10px; margin-bottom: 20px; }
        .company-name { font-size: 24px; color: #047857; font-weight: bold; margin: 0; }
        .company-details { font-size: 10px; color: #718096; margin-top: 5px; }
        
        .title-box { background: #f8fafc; padding: 15px; border-left: 4px solid #059669; margin-bottom: 25px; }
        h1 { margin: 0; font-size: 20px; color: #1e293b; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background-color: #f1f5f9; font-size: 11px; text-transform: uppercase; color: #64748b; }
        
        .section-title { font-size: 16px; color: #047857; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 30px; margin-bottom: 10px; }
        
        .specs-grid { display: table; width: 100%; margin-bottom: 20px; }
        .spec-item { display: table-cell; width: 33%; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; }
        .spec-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; }
        .spec-value { font-size: 16px; font-weight: bold; color: #0f172a; margin-top: 5px; }
        
        .footer { position: fixed; bottom: -20px; left: 0px; right: 0px; height: 30px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #94a3b8; text-align: center; line-height: 30px; }
        .total-row td { font-weight: bold; background: #f8fafc; font-size: 14px; }
    </style>
</head>
<body>

    <div class="header">
        <h2 class="company-name">ECOPAC Power and Technology Ltd.</h2>
        <div class="company-details">Advanced Solar, Substation & Electrical Engineering • Dhaka, Bangladesh</div>
    </div>

    <div class="title-box">
        <h1>Engineering Proposal: {{ $proposal->title }}</h1>
        <table style="border: none; margin: 10px 0 0 0;">
            <tr>
                <td style="border: none; padding: 0;"><strong>Proposal N°:</strong> {{ $proposal->proposal_no }}</td>
                <td style="border: none; padding: 0;"><strong>Date:</strong> {{ \Carbon\Carbon::parse($proposal->created_at)->format('d M Y') }}</td>
                <td style="border: none; padding: 0;"><strong>Valid Until:</strong> {{ \Carbon\Carbon::parse($proposal->valid_until)->format('d M Y') }}</td>
            </tr>
        </table>
    </div>

    @if($proposal->client)
    <div style="margin-bottom: 20px;">
        <strong>Prepared For:</strong><br>
        {{ $proposal->client->company_name }}<br>
        {{ $proposal->client->site_address ?? $proposal->client->district }}
    </div>
    @endif

    <div class="section-title">Executive Summary</div>
    <p>{!! nl2br(e($proposal->notes ?? 'This proposal outlines the technical specifications, timeline, and financial breakdown for the requested engineering project.')) !!}</p>

    @if($proposal->specs)
    <div class="section-title">System Sizing & Projections</div>
    <div class="specs-grid">
        <div class="spec-item">
            <div class="spec-label">System Size</div>
            <div class="spec-value">{{ $proposal->specs->system_size_kw }} kW</div>
        </div>
        <div class="spec-item">
            <div class="spec-label">Expected Generation</div>
            <div class="spec-value">{{ number_format($proposal->specs->annual_gen_kwh) }} kWh/yr</div>
        </div>
        <div class="spec-item">
            <div class="spec-label">ROI Payback</div>
            <div class="spec-value">{{ $proposal->specs->payback_years }} Years</div>
        </div>
    </div>
    @endif

    @foreach($proposal->sections as $section)
        <div class="section-title">{{ $section->title }}</div>
        <table>
            <thead>
                <tr>
                    <th width="50%">Item Description</th>
                    <th width="15%">Quantity</th>
                    <th width="15%">Unit Price</th>
                    <th width="20%">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($section->items as $item)
                <tr>
                    <td>{{ $item->name }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td>{{ number_format($item->unit_price, 2) }}</td>
                    <td>{{ number_format($item->total_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endforeach

    @if($proposal->total_amount > 0)
    <table style="width: 50%; float: right;">
        <tr class="total-row">
            <td style="text-align: right;">Grand Total (BDT):</td>
            <td style="width: 40%;">{{ number_format($proposal->total_amount, 2) }}</td>
        </tr>
    </table>
    <div style="clear: both;"></div>
    @endif

    <div style="margin-top: 80px;">
        <table style="border: none;">
            <tr>
                <td style="border: none; border-top: 1px solid #cbd5e1; width: 40%; text-align: center; padding-top: 10px;">
                    Authorized Signature (ECOPAC)
                </td>
                <td style="border: none; width: 20%;"></td>
                <td style="border: none; border-top: 1px solid #cbd5e1; width: 40%; text-align: center; padding-top: 10px;">
                    Client Acceptance Signature
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Generated by SolarEdge ERP • Page 1 of 1 • {{ optional($proposal->created_at)->format('Y-m-d H:i') }}
    </div>

</body>
</html>
