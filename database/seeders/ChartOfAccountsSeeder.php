<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Account;

class ChartOfAccountsSeeder extends Seeder
{
    /**
     * Standard Chart of Accounts for an EPC / Solar company (BDT).
     *
     * Codes follow the convention:
     *  1xxx = Assets      (Debit normal)
     *  2xxx = Liabilities (Credit normal)
     *  3xxx = Equity      (Credit normal)
     *  4xxx = Income      (Credit normal)
     *  5xxx = Expenses    (Debit normal)
     */
    public function run(): void
    {
        $accounts = [
            // ── ASSETS ────────────────────────────────────
            ['code' => '1000', 'name' => 'Assets',                        'type' => 'asset',     'parent' => null,   'system' => true],
            ['code' => '1100', 'name' => 'Current Assets',                'type' => 'asset',     'parent' => '1000', 'system' => true],
            ['code' => '1110', 'name' => 'Cash on Hand',                  'type' => 'asset',     'parent' => '1100', 'system' => true],
            ['code' => '1120', 'name' => 'Bank Account (Primary)',         'type' => 'asset',     'parent' => '1100', 'system' => true],
            ['code' => '1130', 'name' => 'Mobile Banking (bKash/Nagad)',   'type' => 'asset',     'parent' => '1100', 'system' => false],
            ['code' => '1200', 'name' => 'Accounts Receivable',           'type' => 'asset',     'parent' => '1100', 'system' => true],
            ['code' => '1300', 'name' => 'Inventory / Materials Stock',   'type' => 'asset',     'parent' => '1100', 'system' => false],
            ['code' => '1400', 'name' => 'Prepaid Expenses',              'type' => 'asset',     'parent' => '1100', 'system' => false],
            ['code' => '1500', 'name' => 'Fixed Assets',                  'type' => 'asset',     'parent' => '1000', 'system' => false],
            ['code' => '1510', 'name' => 'Equipment & Tools',             'type' => 'asset',     'parent' => '1500', 'system' => false],
            ['code' => '1520', 'name' => 'Vehicles',                      'type' => 'asset',     'parent' => '1500', 'system' => false],
            ['code' => '1590', 'name' => 'Accumulated Depreciation',      'type' => 'asset',     'parent' => '1500', 'system' => false],

            // ── LIABILITIES ────────────────────────────────
            ['code' => '2000', 'name' => 'Liabilities',                   'type' => 'liability', 'parent' => null,   'system' => true],
            ['code' => '2100', 'name' => 'Current Liabilities',           'type' => 'liability', 'parent' => '2000', 'system' => true],
            ['code' => '2110', 'name' => 'Accounts Payable',              'type' => 'liability', 'parent' => '2100', 'system' => true],
            ['code' => '2120', 'name' => 'VAT Payable',                   'type' => 'liability', 'parent' => '2100', 'system' => true],
            ['code' => '2130', 'name' => 'Advance from Clients',          'type' => 'liability', 'parent' => '2100', 'system' => false],
            ['code' => '2200', 'name' => 'Long-term Liabilities',         'type' => 'liability', 'parent' => '2000', 'system' => false],
            ['code' => '2210', 'name' => 'Bank Loans',                    'type' => 'liability', 'parent' => '2200', 'system' => false],

            // ── EQUITY ────────────────────────────────────
            ['code' => '3000', 'name' => 'Equity',                        'type' => 'equity',    'parent' => null,   'system' => true],
            ['code' => '3100', 'name' => "Owner's Capital",               'type' => 'equity',    'parent' => '3000', 'system' => true],
            ['code' => '3200', 'name' => 'Retained Earnings',             'type' => 'equity',    'parent' => '3000', 'system' => true],

            // ── INCOME ────────────────────────────────────
            ['code' => '4000', 'name' => 'Income',                        'type' => 'income',    'parent' => null,   'system' => true],
            ['code' => '4100', 'name' => 'Project Revenue',               'type' => 'income',    'parent' => '4000', 'system' => true],
            ['code' => '4110', 'name' => 'Solar Installation Revenue',    'type' => 'income',    'parent' => '4100', 'system' => false],
            ['code' => '4120', 'name' => 'Substation / EPC Revenue',      'type' => 'income',    'parent' => '4100', 'system' => false],
            ['code' => '4200', 'name' => 'Service & Maintenance Revenue', 'type' => 'income',    'parent' => '4000', 'system' => false],
            ['code' => '4300', 'name' => 'Material / Equipment Sales',    'type' => 'income',    'parent' => '4000', 'system' => false],
            ['code' => '4900', 'name' => 'Other Income',                  'type' => 'income',    'parent' => '4000', 'system' => false],

            // ── EXPENSES ──────────────────────────────────
            ['code' => '5000', 'name' => 'Expenses',                      'type' => 'expense',   'parent' => null,   'system' => true],
            ['code' => '5100', 'name' => 'Cost of Goods Sold (COGS)',      'type' => 'expense',   'parent' => '5000', 'system' => true],
            ['code' => '5110', 'name' => 'Material Purchases',            'type' => 'expense',   'parent' => '5100', 'system' => false],
            ['code' => '5120', 'name' => 'Installation Labor',            'type' => 'expense',   'parent' => '5100', 'system' => false],
            ['code' => '5200', 'name' => 'Operating Expenses',            'type' => 'expense',   'parent' => '5000', 'system' => true],
            ['code' => '5210', 'name' => 'Salaries & Wages',              'type' => 'expense',   'parent' => '5200', 'system' => false],
            ['code' => '5220', 'name' => 'Office Rent',                   'type' => 'expense',   'parent' => '5200', 'system' => false],
            ['code' => '5230', 'name' => 'Utilities (Electricity, etc.)', 'type' => 'expense',   'parent' => '5200', 'system' => false],
            ['code' => '5240', 'name' => 'Fuel & Transportation',         'type' => 'expense',   'parent' => '5200', 'system' => false],
            ['code' => '5250', 'name' => 'Communication & Internet',      'type' => 'expense',   'parent' => '5200', 'system' => false],
            ['code' => '5300', 'name' => 'Finance Charges',               'type' => 'expense',   'parent' => '5000', 'system' => false],
            ['code' => '5310', 'name' => 'Bank Charges',                  'type' => 'expense',   'parent' => '5300', 'system' => false],
            ['code' => '5320', 'name' => 'Loan Interest',                 'type' => 'expense',   'parent' => '5300', 'system' => false],
            ['code' => '5900', 'name' => 'Other Expenses',                'type' => 'expense',   'parent' => '5000', 'system' => false],
        ];

        // First pass: create parents/roots
        $codeToId = [];
        foreach ($accounts as $data) {
            if ($data['parent'] === null) {
                $acc = Account::firstOrCreate(['code' => $data['code']], [
                    'name'      => $data['name'],
                    'type'      => $data['type'],
                    'is_system' => $data['system'],
                    'parent_id' => null,
                ]);
                $codeToId[$data['code']] = $acc->id;
            }
        }

        // Second pass: create all others (single level should suffice given ordered list)
        foreach ($accounts as $data) {
            if ($data['parent'] !== null) {
                $acc = Account::firstOrCreate(['code' => $data['code']], [
                    'name'      => $data['name'],
                    'type'      => $data['type'],
                    'is_system' => $data['system'],
                    'parent_id' => $codeToId[$data['parent']] ?? null,
                ]);
                $codeToId[$data['code']] = $acc->id;
            }
        }

        $this->command->info('Chart of Accounts seeded: ' . count($accounts) . ' accounts.');
    }
}
