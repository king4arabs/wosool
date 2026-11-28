<?php

return [
    // Disabled until a verified platform administrator's immutable local ID
    // is explicitly selected. Never use a default or shared credential.
    'operator_user_id' => env('WOSOOL_DATA_OPERATOR_USER_ID'),

    // Non-production CLI identity for narrowly allowlisted corrections. This
    // is not a platform user, administrator credential, or production grant.
    'agent' => [
        'enabled' => env('WOSOOL_DATA_AGENT_ENABLED', false),
        'identity' => env('WOSOOL_DATA_AGENT_ID'),
        'expires_at' => env('WOSOOL_DATA_AGENT_EXPIRES_AT'),
    ],
];
