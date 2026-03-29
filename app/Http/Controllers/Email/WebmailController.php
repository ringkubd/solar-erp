<?php

namespace App\Http\Controllers\Email;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\Mail\IMAPService;
use App\Models\EmailAccount;
use App\Models\MailLog;
use Illuminate\Support\Facades\Mail;
use App\Services\AI\OllamaService;

class WebmailController extends Controller
{
    protected $imap;
    protected $ai;

    public function __construct(IMAPService $imap, OllamaService $ai)
    {
        $this->imap = $imap;
        $this->ai = $ai;
    }

    private function getAccount(Request $request)
    {
        $user = $request->user();
        $employee = null;

        if ($user instanceof \App\Models\Employee) {
            $employee = $user;
        } else {
            $employee = $user->employee;
        }

        if (!$employee || !$employee->emailAccount) {
            abort(403, 'Email account not found for this user.');
        }
        return $employee->emailAccount;
    }

    public function inbox(Request $request)
    {
        $account = $this->getAccount($request);
        $folder = $request->query('folder', 'INBOX');
        $page = $request->query('page', 1);

        try {
            $messages = $this->imap->fetchMessages($account, $folder, 20, $page);
            return response()->json($messages);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show(Request $request, $uid)
    {
        $account = $this->getAccount($request);
        $folder = $request->query('folder', 'INBOX');

        try {
            $message = $this->imap->getMessage($account, $uid, $folder);
            return response()->json($message);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function send(Request $request)
    {
        $account = $this->getAccount($request);
        
        $request->validate([
            'to'      => 'required|email',
            'subject' => 'required|string',
            'body'    => 'required|string',
        ]);

        try {
            // Configure temporary SMTP for this account if needed, 
            // but here we just use the system default for now 
            // since Exim4 handles the relay.
            Mail::raw($request->body, function ($message) use ($request, $account) {
                $message->from($account->email, $account->employee->full_name)
                        ->to($request->to)
                        ->subject($request->subject);
            });

            // Log the mail
            MailLog::create([
                'email_account_id' => $account->id,
                'subject'          => $request->subject,
                'recipient'        => $request->to,
                'type'             => 'sent',
                'sender_ip'        => $request->ip(),
            ]);

            return response()->json(['message' => 'Email sent successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function summarize(Request $request, $uid)
    {
        $account = $this->getAccount($request);
        $message = $this->imap->getMessage($account, $uid, $request->query('folder', 'INBOX'));
        
        if (!$message) return response()->json(['error' => 'Not found'], 404);

        try {
            $summary = $this->ai->summarizeEmail($message['body']);
            return response()->json(['summary' => $summary]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function generateDraft(Request $request)
    {
        $request->validate(['prompt' => 'required|string']);

        try {
            $draft = $this->ai->composeEmail($request->prompt);
            return response()->json(['draft' => $draft]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
