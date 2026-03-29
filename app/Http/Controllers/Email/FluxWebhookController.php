<?php

namespace App\Http\Controllers\Email;

use App\Http\Controllers\Controller;
use App\Services\FluxAgentService;
use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class FluxWebhookController extends Controller
{
    /**
     * Handle webhook from FluxAgent for mail account status.
     */
    public function handle(Request $request)
    {
        $signature = $request->header('X-Flux-Signature', '');
        $rawBody   = $request->getContent();

        if (! FluxAgentService::verifyWebhookSignature($rawBody, $signature)) {
            Log::warning('FluxAgent Webhook: Invalid signature');
            abort(401, 'Invalid webhook signature');
        }

        $payload = $request->json()->all();
        Log::info('FluxAgent Webhook Received', $payload);

        $jobId = $payload['job_id'] ?? null;
        $status = $payload['status'] ?? null;

        if ($jobId) {
            $account = EmailAccount::where('provisioning_job_id', $jobId)->first();
            
            if ($account) {
                if ($status === 'completed') {
                    $account->update(['status' => 'active']);
                } elseif ($status === 'failed') {
                    $account->update(['status' => 'failed', 'error_log' => $payload['stderr'] ?? 'Unknown error']);
                    Log::error("FluxAgent Provisioning Failed for {$account->email}", $payload);
                }
            }
        }

        return response()->noContent();
    }
}
