<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;

class OllamaService
{
    protected $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('OLLAMA_BASE_URL', 'http://127.0.0.1:11434');
    }

    /**
     * Generate text using local Ollama model.
     */
    public function generate($prompt, $model = 'llama3.2:1b')
    {
        $response = Http::post("{$this->baseUrl}/api/generate", [
            'model'  => $model,
            'prompt' => $prompt,
            'stream' => false,
        ]);

        if ($response->successful()) {
            return $response->json()['response'];
        }

        \Log::error('Ollama Error', ['body' => $response->body()]);
        throw new \Exception('Ollama generation failed: ' . $response->body());
    }

    /**
     * Specifically formats a prompt for email summarization.
     */
    public function summarizeEmail($body)
    {
        $prompt = "Summarize the following email in a short, professional paragraph:\n\n" . strip_tags($body);
        return $this->generate($prompt);
    }

    /**
     * Specifically formats a prompt for email composition.
     */
    public function composeEmail($instruction)
    {
        $prompt = "Write a professional business email based on these instructions: $instruction\n\nEmail:";
        return $this->generate($prompt);
    }
}
