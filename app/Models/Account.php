<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'code', 'name', 'type', 'parent_id', 'is_system', 'is_active', 'description'
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function parent()
    {
        return $this->belongsTo(Account::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Account::class, 'parent_id');
    }

    public function journalEntries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    /**
     * Normal balance: assets & expenses have debit normal balance,
     * liabilities, equity, income have credit normal balance.
     */
    public function normalBalance(): string
    {
        return in_array($this->type, ['asset', 'expense']) ? 'debit' : 'credit';
    }

    /**
     * Calculate the running balance for this account.
     * Debit-normal accounts: balance = debits - credits
     * Credit-normal accounts: balance = credits - debits
     */
    public function balance(?string $from = null, ?string $to = null): float
    {
        $query = $this->journalEntries()->whereHas('journal', fn($q) => $q->where('is_posted', true));

        if ($from) $query->whereHas('journal', fn($q) => $q->whereDate('date', '>=', $from));
        if ($to)   $query->whereHas('journal', fn($q) => $q->whereDate('date', '<=', $to));

        $debits  = (clone $query)->where('type', 'debit')->sum('amount');
        $credits = (clone $query)->where('type', 'credit')->sum('amount');

        return $this->normalBalance() === 'debit'
            ? ($debits - $credits)
            : ($credits - $debits);
    }
}
