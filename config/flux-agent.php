<?php

return [
    'url'            => env('FLUX_AGENT_URL',      'http://127.0.0.1:5000'),
    'api_key'        => env('FLUX_AGENT_API_KEY',  ''),
    'timeout'        => (int) env('FLUX_AGENT_TIMEOUT', 10),
    'webhook_secret' => env('FLUX_WEBHOOK_SECRET', ''),
];
