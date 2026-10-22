<?php

return [
    // Live intake stays closed until the controller, retention and processor register are approved.
    'privacy_ready' => (bool) env('GATEWAY_PRIVACY_READY', false),
    'email_updates' => (bool) env('GATEWAY_EMAIL_UPDATES', false),
];
