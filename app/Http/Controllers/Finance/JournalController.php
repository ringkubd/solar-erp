<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Journal;
use App\Services\AccountingService;

class JournalController extends Controller
{
    public function __construct(private AccountingService $svc) {}

    // GET /journals
    public function index(Request $request)
    {
        $query = Journal::with('entries.account')
            ->orderByDesc('date');

        if ($request->filled('source')) $query->where('source', $request->source);
        if ($request->filled('from'))   $query->whereDate('date', '>=', $request->from);
        if ($request->filled('to'))     $query->whereDate('date', '<=', $request->to);

        return response()->json($query->paginate(25));
    }

    // GET /journals/{id}
    public function show($id)
    {
        return response()->json(
            Journal::with(['entries.account', 'creator'])->findOrFail($id)
        );
    }

    // POST /journals — Manual journal entry
    public function store(Request $request)
    {
        $request->validate([
            'date'              => 'required|date',
            'description'       => 'required|string|max:255',
            'entries'           => 'required|array|min:2',
            'entries.*.account_id' => 'required|exists:accounts,id',
            'entries.*.type'    => 'required|in:debit,credit',
            'entries.*.amount'  => 'required|numeric|min:0.01',
            'entries.*.narration' => 'nullable|string|max:255',
        ]);

        try {
            $journal = $this->svc->post([
                'date'        => $request->date,
                'description' => $request->description,
                'source'      => 'manual',
            ], $request->entries);

            return response()->json($journal->load('entries.account'), 201);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
