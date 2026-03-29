<?php

return [
    'default' => 'main',
    'accounts' => [
        'main' => [
            'host'  => env('IMAP_HOST', '127.0.0.1'),
            'port'  => env('IMAP_PORT', 993),
            'protocol'  => 'imap',
            'encryption'    => env('IMAP_ENCRYPTION', 'ssl'),
            'validate_cert' => env('IMAP_VALIDATE_CERT', true),
            'username' => env('IMAP_USERNAME', 'root@example.com'),
            'password' => env('IMAP_PASSWORD', ''),
            'authentication' => null,
            'proxy' => [
                'socket' => null,
                'request_fulluri' => false,
                'username' => null,
                'password' => null,
            ]
        ],
    ],
    'options' => [
        'delimiter' => '/',
        'fetch' => \Webklex\PHPIMAP\IMAP::FT_PEEK,
        'fetch_order' => 'asc',
        'fetch_step' => 20,
        'open' => [
            'DISABLE_AUTHENTICATOR' => 'GSSAPI'
        ],
        'boundary' => '/#\s*--([^\s]+)--/',
        'message' => [
            'type' => 'text',
            'base64' => true,
        ],
        'attachment' => [
            'base64' => true,
        ],
    ],
    'flags' => ['recent', 'flagged', 'answered', 'deleted', 'seen', 'draft'],
];
