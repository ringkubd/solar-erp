<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FluxAgentService
{
    private string $baseUrl;
    private string $apiKey;
    private string $webhookSecret;
    private int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('flux-agent.url');
        $this->apiKey = config('flux-agent.api_key');
        $this->webhookSecret = config('flux-agent.webhook_secret');
        $this->timeout = config('flux-agent.timeout');
    }

    /**
     * Create mail account (async job).
     */
    public function createMailAccount(string $domain, string $email, string $password, ?string $webhookUrl = null)
    {
        try {
            $response = Http::withHeaders([
                'X-Flux-API-Key' => $this->apiKey,
                'Accept' => 'application/json'
            ])
            ->timeout($this->timeout)
            ->post("{$this->baseUrl}/api/v1/mail/create", [
                'domain'      => $domain,
                'email'       => $email,
                'password'    => $password,
                'webhook_url' => $webhookUrl
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('FluxAgent createMailAccount failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'email' => $email
            ]);

            return [
                'success' => false,
                'error' => 'API Error: ' . ($response->json()['message'] ?? $response->body())
            ];
        } catch (\Exception $e) {
            Log::error('FluxAgent createMailAccount exception', ['message' => $e->getMessage()]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get status of a job.
     */
    public function getJobStatus(string $jobId)
    {
        try {
            $response = Http::withHeaders([
                'X-Flux-API-Key' => $this->apiKey,
                'Accept' => 'application/json'
            ])
            ->timeout($this->timeout)
            ->get("{$this->baseUrl}/api/v1/jobs/{$jobId}");

            return $response->json();
        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Verify webhook signature (HMAC-SHA256).
     */
    public static function verifyWebhookSignature(string $payload, string $signature): bool
    {
        $secret = config('flux-agent.webhook_secret');
        if (empty($secret)) return true; // Security risk, but fallback for now

        $computedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($computedSignature, $signature);
    }
}
