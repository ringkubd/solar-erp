<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Journal;
use App\Models\JournalEntry;
use App\Models\Invoice;
use App\Models\MoneyReceipt;
use Illuminate\Support\Facades\DB;

class AccountingService
{
    // ──────────────────────────────────────────────────────────────────────────
    //  CORE: Post a balanced journal entry
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Create and post a journal entry.
     *
     * @param array $header  { date, description, source, source_id }
     * @param array $lines   [{ account_id, type('debit'|'credit'), amount, narration? }]
     * @throws \Exception if unbalanced
     */
    public function post(array $header, array $lines): Journal
    {
        return DB::transaction(function () use ($header, $lines) {

            // ── Balance check ──
            $debits  = collect($lines)->where('type', 'debit')->sum('amount');
            $credits = collect($lines)->where('type', 'credit')->sum('amount');

            if (abs($debits - $credits) > 0.001) {
                throw new \Exception(
                    "Unbalanced journal: Debits ৳{$debits} ≠ Credits ৳{$credits}. Difference: ৳" . abs($debits - $credits)
                );
            }

            // ── Create header ──
            $journal = Journal::create(array_merge($header, [
                'is_posted'  => true,
                'created_by' => auth()->id(),
            ]));

            // ── Create lines ──
            foreach ($lines as $line) {
                JournalEntry::create([
                    'journal_id' => $journal->id,
                    'account_id' => $line['account_id'],
                    'project_id' => $line['project_id'] ?? null,
                    'type'       => $line['type'],
                    'amount'     => $line['amount'],
                    'narration'  => $line['narration'] ?? null,
                ]);
            }

            return $journal->load('entries.account');
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  AUTO JOURNALS: Invoice created → Debit Receivable, Credit Revenue
    // ──────────────────────────────────────────────────────────────────────────

    public function journalizeInvoice(Invoice $invoice): Journal
    {
        $receivable = Account::where('code', '1200')->firstOrFail();  // Accounts Receivable
        $revenue    = Account::where('code', '4100')->firstOrFail();  // Project Revenue
        $vatPayable = Account::where('code', '2120')->firstOrFail();  // VAT Payable

        $lines = [
            [   // Debit: what the client owes us
                'account_id' => $receivable->id,
                'type'       => 'debit',
                'amount'     => $invoice->total_amount,
                'narration'  => "Invoice {$invoice->invoice_no} — billed to client",
            ],
            [   // Credit: revenue earned
                'account_id' => $revenue->id,
                'type'       => 'credit',
                'amount'     => $invoice->subtotal,
                'narration'  => "Revenue for {$invoice->invoice_no}",
            ],
        ];

        // Add VAT credit if applicable
        if (floatval($invoice->vat_amount) > 0) {
            $lines[] = [
                'account_id' => $vatPayable->id,
                'type'       => 'credit',
                'amount'     => $invoice->vat_amount,
                'narration'  => "VAT on {$invoice->invoice_no}",
            ];
        }

        return $this->post([
            'date'        => $invoice->issue_date->toDateString(),
            'description' => "Invoice {$invoice->invoice_no}",
            'source'      => 'invoice',
            'source_id'   => $invoice->id,
        ], $lines);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  AUTO JOURNALS: Money Receipt → Debit Cash/Bank, Credit Receivable
    // ──────────────────────────────────────────────────────────────────────────

    public function journalizeReceipt(MoneyReceipt $receipt): Journal
    {
        $cashAccount = match($receipt->payment_method) {
            'mobile_banking' => Account::where('code', '1130')->first(),
            'bank_transfer'  => Account::where('code', '1120')->first(),
            default          => Account::where('code', '1110')->first(),  // Cash on Hand
        };

        $receivable = Account::where('code', '1200')->firstOrFail();

        return $this->post([
            'date'        => $receipt->receipt_date->toDateString(),
            'description' => "Payment received — {$receipt->receipt_no}",
            'source'      => 'money_receipt',
            'source_id'   => $receipt->id,
        ], [
            [
                'account_id' => $cashAccount->id,
                'type'       => 'debit',
                'amount'     => $receipt->amount,
                'narration'  => "Cash received via {$receipt->payment_method}",
            ],
            [
                'account_id' => $receivable->id,
                'type'       => 'credit',
                'amount'     => $receipt->amount,
                'narration'  => "Reduce receivable for {$receipt->receipt_no}",
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  AUTO JOURNALS: Stock Consumed → Debit Material Expense, Credit Inventory
    // ──────────────────────────────────────────────────────────────────────────

    public function journalizeStockConsumption(\App\Models\StockMovement $movement): Journal
    {
        $materialExpense = Account::where('code', '5100')->firstOrFail(); // Assuming 5100 is Material Expense
        $inventoryAsset  = Account::where('code', '1300')->firstOrFail(); // Assuming 1300 is Inventory Asset

        $totalCost = $movement->quantity * ($movement->unit_cost ?? 0);
        if ($totalCost <= 0) {
            // If we don't track cost yet, skip journalizing or use a default
            return null; // For safety
        }

        return $this->post([
            'date'        => $movement->created_at->toDateString(),
            'description' => "Material Usage: {$movement->item->name} ({$movement->quantity} {$movement->item->unit})",
            'source'      => 'stock_movement',
            'source_id'   => $movement->id,
        ], [
            [
                'account_id' => $materialExpense->id,
                'type'       => 'debit',
                'amount'     => $totalCost,
                'narration'  => "Consumption expense - Ref: {$movement->reference_type} #{$movement->reference_id}",
            ],
            [
                'account_id' => $inventoryAsset->id,
                'type'       => 'credit',
                'amount'     => $totalCost,
                'narration'  => "Reduce inventory asset",
            ],
        ]);
    }

    /**
     * AUTO JOURNALS: Stock Purchased (GRN) → Debit Inventory, Credit Accounts Payable
     */
    public function journalizePurchase(\App\Models\StockMovement $movement): Journal
    {
        $inventoryAsset = Account::where('code', '1300')->firstOrFail(); // Inventory / Materials Stock
        $payable        = Account::where('code', '2110')->firstOrFail(); // Accounts Payable

        $totalCost = $movement->total_cost ?? ($movement->quantity * ($movement->unit_cost ?? 0));
        if ($totalCost <= 0) {
            return null;
        }

        return $this->post([
            'date'        => $movement->created_at->toDateString(),
            'description' => "Inventory Purchase: {$movement->item->name} ({$movement->quantity} {$movement->item->unit})",
            'source'      => 'stock_movement',
            'source_id'   => $movement->id,
        ], [
            [
                'account_id' => $inventoryAsset->id,
                'type'       => 'debit',
                'amount'     => $totalCost,
                'narration'  => "Increase inventory asset via Purchase Ref #{$movement->reference_id}",
            ],
            [
                'account_id' => $payable->id,
                'type'       => 'credit',
                'amount'     => $totalCost,
                'narration'  => "Accounts Payable - Vendor Ref #{$movement->reference_id}",
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  REPORTS
    // ──────────────────────────────────────────────────────────────────────────

    public function trialBalance(?string $asOf = null): array
    {
        $date = $asOf ?? now()->toDateString();

        $accounts = Account::with(['journalEntries.journal'])
            ->where('is_active', true)
            ->get();

        $rows = [];
        foreach ($accounts as $acc) {
            $balance = $acc->balance(null, $date);
            if ($balance == 0) continue;

            $rows[] = [
                'code'       => $acc->code,
                'name'       => $acc->name,
                'type'       => $acc->type,
                'balance'    => $balance,
                'normal'     => $acc->normalBalance(),
            ];
        }

        return [
            'as_of' => $date,
            'rows'  => $rows,
            'total_debit'  => collect($rows)->where('normal', 'debit')->sum('balance'),
            'total_credit' => collect($rows)->where('normal', 'credit')->sum('balance'),
        ];
    }

    public function balanceSheet(?string $asOf = null): array
    {
        $date = $asOf ?? now()->toDateString();
        $accounts = Account::whereIn('type', ['asset', 'liability', 'equity'])->where('is_active', true)->get();

        $assets = [];
        $liabilities = [];
        $equity = [];

        foreach ($accounts as $acc) {
            $balance = $acc->balance(null, $date);
            if ($balance == 0) continue;

            $row = ['code' => $acc->code, 'name' => $acc->name, 'amount' => $balance];
            match($acc->type) {
                'asset'     => $assets[] = $row,
                'liability' => $liabilities[] = $row,
                'equity'    => $equity[] = $row,
            };
        }

        // Add Retained Earnings (Net Profit from beginning of time until now)
        $pnl = $this->profitAndLoss('1970-01-01', $date);
        $retainedEarnings = $pnl['net_profit'];
        if ($retainedEarnings != 0) {
            $equity[] = ['code' => '3900', 'name' => 'Retained Earnings (P&L)', 'amount' => $retainedEarnings];
        }

        return [
            'as_of' => $date,
            'assets' => $assets,
            'liabilities' => $liabilities,
            'equity' => $equity,
            'total_assets' => collect($assets)->sum('amount'),
            'total_liabilities_equity' => collect($liabilities)->sum('amount') + collect($equity)->sum('amount'),
        ];
    }

    public function journalizePayroll(\App\Models\Payroll $payroll): Journal
    {
        $payableAcc  = Account::where('code', '2110')->firstOrFail(); // Salary Payable
        $cashAccount = Account::where('code', '1110')->firstOrFail(); // Cash on Hand (or Bank)
        
        return $this->post([
            'date'        => now()->toDateString(),
            'description' => "Salary Disbursement - {$payroll->employee->full_name} ({$payroll->month}/{$payroll->year})",
            'source'      => 'payroll',
            'source_id'   => $payroll->id,
        ], [
            [
                'account_id' => $payableAcc->id,
                'type'       => 'debit',
                'amount'     => $payroll->net_salary,
                'narration'  => "Disbursement for {$payroll->employee->full_name}",
            ],
            [
                'account_id' => $cashAccount->id,
                'type'       => 'credit',
                'amount'     => $payroll->net_salary,
                'narration'  => "Cash/Bank payment",
            ],
        ]);
    }

    public function profitAndLoss(string $from, string $to): array
    {
        $accounts = Account::whereIn('type', ['income', 'expense'])->where('is_active', true)->get();

        $income  = [];
        $expense = [];

        foreach ($accounts as $acc) {
            $debits  = JournalEntry::where('account_id', $acc->id)->where('type', 'debit')
                ->whereHas('journal', fn($q) => $q->where('is_posted', true)->whereBetween('date', [$from, $to]))
                ->sum('amount');
            $credits = JournalEntry::where('account_id', $acc->id)->where('type', 'credit')
                ->whereHas('journal', fn($q) => $q->where('is_posted', true)->whereBetween('date', [$from, $to]))
                ->sum('amount');

            $balance = $acc->type === 'income' ? ($credits - $debits) : ($debits - $credits);
            if ($balance == 0) continue;

            $row = ['code' => $acc->code, 'name' => $acc->name, 'amount' => $balance];
            $acc->type === 'income' ? ($income[] = $row) : ($expense[] = $row);
        }

        $totalIncome  = collect($income)->sum('amount');
        $totalExpense = collect($expense)->sum('amount');

        return [
            'period'        => ['from' => $from, 'to' => $to],
            'income'        => $income,
            'expenses'      => $expense,
            'total_income'  => $totalIncome,
            'total_expense' => $totalExpense,
            'net_profit'    => $totalIncome - $totalExpense,
        ];
    }

    public function ledger(int $accountId, string $from, string $to): array
    {
        $account = Account::findOrFail($accountId);

        $entries = JournalEntry::with('journal')
            ->where('account_id', $accountId)
            ->whereHas('journal', fn($q) => $q->where('is_posted', true)->whereBetween('date', [$from, $to]))
            ->orderBy(DB::raw('(SELECT date FROM journals WHERE journals.id = journal_entries.journal_id)'))
            ->get();

        $runningBalance = 0;
        $rows = $entries->map(function ($entry) use ($account, &$runningBalance) {
            $signed = ($account->normalBalance() === 'debit')
                ? ($entry->type === 'debit' ? $entry->amount : -$entry->amount)
                : ($entry->type === 'credit' ? $entry->amount : -$entry->amount);

            $runningBalance += $signed;

            return [
                'date'        => $entry->journal->date,
                'reference'   => $entry->journal->reference,
                'description' => $entry->journal->description,
                'debit'       => $entry->type === 'debit'  ? $entry->amount : null,
                'credit'      => $entry->type === 'credit' ? $entry->amount : null,
                'balance'     => $runningBalance,
                'narration'   => $entry->narration,
            ];
        });

        return [
            'account'         => ['id' => $account->id, 'code' => $account->code, 'name' => $account->name, 'type' => $account->type],
            'period'          => ['from' => $from, 'to' => $to],
            'opening_balance' => 0,
            'entries'         => $rows,
            'closing_balance' => $runningBalance,
        ];
    }
    public function dashboardStats(): array
    {
        $now = now();
        $startOfYear = $now->copy()->startOfYear()->toDateString();
        $today = $now->toDateString();

        // 1. KPI Calculation
        $revenueAccounts = Account::where('type', 'income')->get();
        $expenseAccounts = Account::where('type', 'expense')->get();

        $totalRevenue = 0;
        foreach ($revenueAccounts as $acc) {
            $totalRevenue += $acc->balance($startOfYear, $today);
        }

        $totalExpense = 0;
        foreach ($expenseAccounts as $acc) {
            $totalExpense += $acc->balance($startOfYear, $today);
        }

        $receivableAcc = Account::where('code', '1200')->first();
        $cashAcc       = Account::where('code', '1110')->first();
        $bankAcc       = Account::where('code', '1120')->first();

        // 2. Monthly Trend (6 months)
        $months = [];
        $revTrend = [];
        $expTrend = [];

        for ($i = 5; $i >= 0; $i--) {
            $monthStart = $now->copy()->subMonths($i)->startOfMonth();
            $monthEnd   = $now->copy()->subMonths($i)->endOfMonth();
            $months[]   = $monthStart->format('M Y');

            $mRev = 0;
            foreach ($revenueAccounts as $acc) {
                $mRev += $acc->balance($monthStart->toDateString(), $monthEnd->toDateString());
            }
            $revTrend[] = $mRev;

            $mExp = 0;
            foreach ($expenseAccounts as $acc) {
                $mExp += $acc->balance($monthStart->toDateString(), $monthEnd->toDateString());
            }
            $expTrend[] = $mExp;
        }

        return [
            'kpis' => [
                'total_revenue'    => $totalRevenue,
                'net_profit'       => $totalRevenue - $totalExpense,
                'total_receivable' => $receivableAcc ? $receivableAcc->balance() : 0,
                'cash_bank'        => ($cashAcc ? $cashAcc->balance() : 0) + ($bankAcc ? $bankAcc->balance() : 0),
            ],
            'trends' => [
                'labels'   => $months,
                'revenue'  => $revTrend,
                'expenses' => $expTrend,
            ],
            'recent_journals' => Journal::with('entries.account')->where('is_posted', true)->orderByDesc('date')->orderByDesc('id')->take(5)->get(),
        ];
    }
}
