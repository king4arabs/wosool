<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmissionEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_submission_succeeds_with_valid_payload(): void
    {
        $payload = [
            'full_name' => 'Alya Al-Harbi',
            'email' => 'alya@example.com',
            'phone' => '+966500000000',
            'company_name' => 'Najm Labs',
            'company_website' => 'https://najm.example.com',
            'sector' => 'Fintech',
            'stage' => 'Seed',
            'location' => 'Riyadh, Saudi Arabia',
            'motivation' => 'We want to join to access a trusted founder network and accelerate execution.',
            'what_you_offer' => 'Fintech operating experience and distribution insight.',
            'what_you_need' => 'Warm introductions and growth support.',
            'linkedin_url' => 'https://www.linkedin.com/in/alya-example',
            'referral_source' => 'Founder referral',
            'referrer_name' => 'Maha Al-Qahtani',
        ];

        $response = $this->postJson('/api/v1/applications', $payload);

        $response
            ->assertCreated()
            ->assertJsonStructure(['message', 'reference']);

        $this->assertDatabaseHas('applications', [
            'email' => 'alya@example.com',
            'company_name' => 'Najm Labs',
        ]);
    }

    public function test_application_submission_returns_validation_errors_for_invalid_payload(): void
    {
        $response = $this->postJson('/api/v1/applications', [
            'email' => 'not-an-email',
            'stage' => 'Invalid Stage',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['full_name', 'email', 'phone', 'company_name', 'sector', 'stage', 'location', 'motivation']);
    }

    public function test_contact_submission_succeeds_with_valid_payload(): void
    {
        $payload = [
            'name' => 'Faisal Al-Otaibi',
            'email' => 'faisal@example.com',
            'category' => 'partnerships',
            'subject' => 'Partnership inquiry',
            'message' => 'We would like to explore a regional ecosystem partnership with Wosool.',
            'company' => 'Regional Partners Co.',
        ];

        $response = $this->postJson('/api/v1/contact', $payload);

        $response
            ->assertCreated()
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('contact_messages', [
            'email' => 'faisal@example.com',
            'subject' => 'Partnership inquiry',
        ]);
    }

    public function test_contact_submission_returns_validation_errors_for_invalid_payload(): void
    {
        $response = $this->postJson('/api/v1/contact', [
            'email' => 'invalid-email',
            'category' => 'unknown',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'category', 'subject', 'message']);
    }
}
