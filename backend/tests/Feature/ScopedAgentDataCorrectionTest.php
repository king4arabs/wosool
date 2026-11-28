<?php

namespace Tests\Feature;

use App\Models\FounderProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ScopedAgentDataCorrectionTest extends TestCase
{
    use RefreshDatabase;

    private const ACTOR = 'wosool-agent-fixture';
    private const REASON = 'Verified correction against the official company profile.';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'data_operations.agent.enabled' => true,
            'data_operations.agent.identity' => self::ACTOR,
            'data_operations.agent.expires_at' => now()->addHour()->toIso8601String(),
        ]);
    }

    public function test_scoped_agent_previews_then_applies_one_audited_fixture_correction(): void
    {
        $target = FounderProfile::create([
            'slug' => 'synthetic-unclaimed-founder',
            'display_name' => 'Synthetic Founder',
            'website_url' => 'https://old.example.test',
            'status' => 'active',
        ]);
        $other = FounderProfile::create([
            'slug' => 'synthetic-other-founder',
            'display_name' => 'Other Synthetic Founder',
            'website_url' => 'https://other.example.test',
            'status' => 'active',
        ]);
        $options = $this->commandOptions($target, ['--value' => 'https://new.example.test']);

        $this->artisan('wosool:agent-correct-founder', $options)
            ->expectsOutputToContain('"status":"previewed"')
            ->expectsOutputToContain('"would_change":true')
            ->assertSuccessful();

        $this->assertSame('https://old.example.test', $target->fresh()->website_url);
        $this->assertDatabaseHas('data_operation_audits', [
            'project' => 'wosool',
            'actor_id' => self::ACTOR,
            'target_id' => $target->id,
            'field' => 'website_url',
            'status' => 'previewed',
        ]);

        $this->artisan('wosool:agent-correct-founder', $options + ['--apply' => true])
            ->expectsOutputToContain('"status":"applied"')
            ->assertSuccessful();

        $this->assertSame('https://new.example.test', $target->fresh()->website_url);
        $this->assertSame('https://other.example.test', $other->fresh()->website_url);
        $this->assertDatabaseCount('data_operation_audits', 2);

        $audit = DB::table('data_operation_audits')->where('status', 'applied')->first();
        $this->assertSame(hash('sha256', 'https://old.example.test'), $audit->before_hash);
        $this->assertSame(hash('sha256', 'https://new.example.test'), $audit->after_hash);
        $this->assertStringNotContainsString('old.example.test', json_encode($audit));
        $this->assertStringNotContainsString('new.example.test', json_encode($audit));
    }

    public function test_cross_project_expired_claimed_privileged_and_stale_operations_are_denied(): void
    {
        $target = FounderProfile::create([
            'slug' => 'synthetic-denied-founder',
            'display_name' => 'Denied Synthetic Founder',
            'website_url' => 'https://old.example.test',
        ]);

        config(['data_operations.agent.enabled' => false]);
        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target))
            ->expectsOutputToContain('disabled')
            ->assertFailed();
        config(['data_operations.agent.enabled' => true]);

        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target, ['--project' => 'adjacent-project']))
            ->expectsOutputToContain('Cross-project')
            ->assertFailed();

        config(['data_operations.agent.expires_at' => now()->subMinute()->toIso8601String()]);
        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target))
            ->expectsOutputToContain('expired')
            ->assertFailed();
        config(['data_operations.agent.expires_at' => now()->addHour()->toIso8601String()]);

        foreach (['is_public', 'role', 'export', 'deleted_at'] as $deniedField) {
            $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target, ['--field' => $deniedField]))
                ->expectsOutputToContain('allowlisted')
                ->assertFailed();
        }

        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target, ['--actor' => 'adjacent-agent']))
            ->expectsOutputToContain('identity')
            ->assertFailed();

        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target, ['--expected-updated-at' => now()->subDay()->toIso8601String()]))
            ->expectsOutputToContain('changed after preview')
            ->assertFailed();

        $target->forceFill(['user_id' => \App\Models\User::factory()->create()->id, 'claimed_at' => now()])->save();
        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target))
            ->expectsOutputToContain('unclaimed founder fixture')
            ->assertFailed();

        $this->assertSame('https://old.example.test', $target->fresh()->website_url);
        $this->assertDatabaseCount('data_operation_audits', 0);
    }

    public function test_failed_audit_write_rolls_back_the_target_update(): void
    {
        $target = FounderProfile::create([
            'slug' => 'synthetic-rollback-founder',
            'display_name' => 'Rollback Synthetic Founder',
            'website_url' => 'https://old.example.test',
        ]);
        Schema::drop('data_operation_audits');

        $this->artisan('wosool:agent-correct-founder', $this->commandOptions($target, ['--value' => 'https://new.example.test']) + ['--apply' => true])
            ->expectsOutputToContain('failed and was rolled back')
            ->assertFailed();

        $this->assertSame('https://old.example.test', $target->fresh()->website_url);
    }

    /** @return array<string, mixed> */
    private function commandOptions(FounderProfile $target, array $overrides = []): array
    {
        return array_replace([
            '--actor' => self::ACTOR,
            '--project' => 'wosool',
            '--slug' => $target->slug,
            '--field' => 'website_url',
            '--value' => 'https://new.example.test',
            '--expected-updated-at' => $target->updated_at->toIso8601String(),
            '--source-url' => 'https://source.example.test/founder',
            '--reason' => self::REASON,
        ], $overrides);
    }
}
