<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Account;
use App\Services\AccountingService;

class AccountController extends Controller
{
    public function __construct(private AccountingService $svc) {}

    // GET /accounts — Chart of Accounts (tree)
    public function index(Request $request)
    {
        $query = Account::with('children')->whereNull('parent_id')->where('is_active', true);

        return response()->json($query->orderBy('code')->get());
    }

    // GET /accounts/flat — flat list for dropdowns
    public function flat()
    {
        return response()->json(
            Account::where('is_active', true)->orderBy('code')->get(['id', 'code', 'name', 'type'])
        );
    }

    // POST /accounts
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:20|unique:accounts,code',
            'name'        => 'required|string|max:150',
            'type'        => 'required|in:asset,liability,equity,income,expense',
            'parent_id'   => 'nullable|exists:accounts,id',
            'description' => 'nullable|string',
        ]);
        return response()->json(Account::create($validated), 201);
    }

    // ── REPORTS ──────────────────────────────────────────────────────────────

    // GET /reports/trial-balance?as_of=2026-03-24
    public function trialBalance(Request $request)
    {
        $asOf = $request->get('as_of', now()->toDateString());
        return response()->json($this->svc->trialBalance($asOf));
    }

    // GET /reports/profit-loss?from=2026-01-01&to=2026-03-31
    public function profitAndLoss(Request $request)
    {
        $from = $request->get('from', now()->startOfYear()->toDateString());
        $to   = $request->get('to',   now()->toDateString());
        return response()->json($this->svc->profitAndLoss($from, $to));
    }

    // GET /reports/ledger/{account_id}?from=2026-01-01&to=2026-03-31
    public function ledger(Request $request, $accountId)
    {
        $from = $request->get('from', now()->startOfYear()->toDateString());
        $to   = $request->get('to',   now()->toDateString());
        return response()->json($this->svc->ledger($accountId, $from, $to));
    }

    // GET /reports/dashboard
    public function dashboard()
    {
        return response()->json($this->svc->dashboardStats());
    }
}
