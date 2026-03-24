<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Journal extends Model
{
    protected $fillable = [
        'reference', 'date', 'description', 'source', 'source_id', 'created_by', 'is_posted'
    ];

    protected $casts = [
        'date'      => 'date',
        'is_posted' => 'boolean',
    ];

    public function entries()
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Validate that total debits === total credits.
     */
    public function isBalanced(): bool
    {
        $debits  = $this->entries->where('type', 'debit')->sum('amount');
        $credits = $this->entries->where('type', 'credit')->sum('amount');
        return abs($debits - $credits) < 0.001;  // float tolerance
    }

    // Auto-generate reference number
    protected static function booted(): void
    {
        static::creating(function (Journal $journal) {
            if (empty($journal->reference)) {
                $year = now()->year;
                $count = Journal::whereYear('created_at', $year)->count() + 1;
                $journal->reference = sprintf('JNL-%d-%04d', $year, $count);
            }
        });
    }
}
