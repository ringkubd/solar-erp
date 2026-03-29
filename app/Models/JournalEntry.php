<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JournalEntry extends Model
{
    protected $fillable = [
        'journal_id', 'account_id', 'project_id', 'type', 'amount', 'narration'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function journal()
    {
        return $this->belongsTo(Journal::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class);
    }
}
