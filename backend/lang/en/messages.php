<?php

return [
    'auth' => [
        'csrf_initialized' => 'CSRF token initialized.',
        'invalid_credentials' => 'The provided credentials are incorrect.',
        'login_success' => 'Logged in successfully.',
        'email_not_approved' => 'This email is not approved yet. Please submit your founder application first or wait for approval.',
        'invalid_invite_token' => 'Invalid or expired invitation token.',
        'account_created' => 'Account created successfully.',
        'logout_success' => 'Logged out successfully.',
    ],
    'founder' => [
        'profile_not_found' => 'No founder profile found.',
        'profile_created' => 'Profile created.',
        'profile_updated' => 'Profile updated.',
    ],
    'scorecard' => [
        'not_found' => 'No scorecard found.',
        'founder_not_found' => 'Founder profile not found.',
        'recalculated' => 'Scorecard recalculated successfully.',
    ],
    'intro' => [
        'founder_not_found' => 'Founder profile not found for authenticated user.',
        'active_limit_reached' => 'Maximum active introduction requests reached.',
        'active_limit_detail' => 'You already have 3 active INTRO_PENDING requests. Approve, decline, or wait for expiration before creating a new route.',
        'created' => 'Introduction route created successfully.',
        'approve_unauthorized' => 'You are not authorized to approve this introduction route.',
        'approve_invalid_status' => 'Only INTRO_PENDING routes can be approved.',
        'decline_unauthorized' => 'You are not authorized to decline this introduction route.',
        'decline_invalid_status' => 'Only INTRO_PENDING routes can be declined.',
        'approved' => 'Introduction route approved successfully.',
        'declined' => 'Introduction route declined successfully.',
    ],
    'validation' => [
        'application' => [
            'full_name_required' => 'Please enter your full name.',
            'email_required' => 'Please enter your email address.',
            'email_email' => 'Please enter a valid email address.',
            'phone_required' => 'Please enter your phone number.',
            'company_name_required' => 'Please enter your company name.',
            'sector_required' => 'Please select your sector.',
            'stage_required' => 'Please select your company stage.',
            'location_required' => 'Please enter your location.',
            'motivation_required' => 'Please tell us why you want to join Wosool.',
        ],
        'contact' => [
            'name_required' => 'Please enter your name.',
            'email_required' => 'Please enter your email address.',
            'email_email' => 'Please enter a valid email address.',
            'category_required' => 'Please select a category.',
            'subject_required' => 'Please enter a subject.',
            'message_required' => 'Please enter your message.',
        ],
        'program_application' => [
            'motivation_required' => 'Please tell us why you want to join.',
            'motivation_min' => 'Write at least 20 characters about why you want to join.',
        ],
        'introduction' => [
            'target_required' => 'Choose the founder you want to be introduced to.',
            'target_exists' => 'That founder profile no longer exists.',
            'brief_required' => 'Add a short note on why you want this introduction.',
            'brief_min' => 'Write at least 20 characters on why you want this introduction.',
        ],
        'settings' => [
            'current_password_incorrect' => 'The current password is incorrect.',
            'attributes' => [
                'name' => 'name',
                'email' => 'email',
                'current_password' => 'current password',
                'new_password' => 'new password',
            ],
        ],
    ],
];
