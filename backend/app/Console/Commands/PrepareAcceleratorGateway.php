<?php

namespace App\Console\Commands;

use App\Models\PartnerProfile;
use App\Models\Program;
use App\Services\AcceleratorGateway as Gateway;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PrepareAcceleratorGateway extends Command
{
    protected $signature = 'wosool:prepare-gateway {--apply} {--backup-verified} {--staging-verified}';

    protected $description = 'Preview or add the EO local application gateway and partner review entries without demo data.';

    public function handle(): int
    {
        if ($this->option('apply') && app()->isProduction() && (! $this->option('backup-verified') || ! $this->option('staging-verified'))) {
            $this->error('Verify staging and database recovery before production writes.');

            return self::FAILURE;
        }
        if (Program::onlyTrashed()->where('slug', Gateway::SLUG)->exists()) {
            $this->error('A historical gateway program exists. Review and restore it explicitly before preparation.');

            return self::FAILURE;
        }
        $assetPath = base_path('../docs/research/PARTNER-ASSETS.json');
        $assets = is_file($assetPath) ? json_decode(file_get_contents($assetPath), true, flags: JSON_THROW_ON_ERROR) : [];
        $assets = $assets['records'] ?? $assets['partners'] ?? $assets;
        $report = ['mode' => $this->option('apply') ? 'applied' : 'preview', 'program' => Program::where('slug', Gateway::SLUG)->exists() ? 'unchanged' : 'add', 'partners_added' => [], 'partners_unchanged' => []];
        DB::transaction(function () use ($assets, &$report) {
            if ($this->option('apply')) {
                Program::firstOrCreate(['slug' => Gateway::SLUG], [
                    'name' => 'EO Riyadh Accelerator', 'title' => 'EO Riyadh Accelerator', 'category' => 'growth', 'description' => 'Wosool local application and review gateway. EO enrolment remains subject to EO approval.',
                    'language' => 'ar', 'is_open' => true, 'visibility' => 'public', 'status_flow' => 'published', 'city_region' => 'Riyadh',
                    'settings' => ['gateway' => Gateway::defaults()]]);
            }
            foreach ($assets as $asset) {
                if (! is_array($asset) || empty($asset['slug'])) {
                    continue;
                }
                if (PartnerProfile::withTrashed()->where('slug', $asset['slug'])->exists()) {
                    $report['partners_unchanged'][] = $asset['slug'];

                    continue;
                }
                $report['partners_added'][] = $asset['slug'];
                if ($this->option('apply')) {
                    PartnerProfile::create([
                        'slug' => $asset['slug'], 'name' => $asset['name_en'], 'name_ar' => $asset['name_ar'], 'name_en' => $asset['name_en'],
                        'type' => 'ecosystem', 'status' => 'prospective', 'is_public' => false, 'display_order' => $asset['display_order'],
                        'logo_url' => $asset['logo_path'] ?? null, 'website' => $asset['website_url'] ?? null,
                        'identity_status' => $asset['identity_status'], 'asset_status' => $asset['asset_status'], 'designation_status' => 'needs_review',
                        'logo_source_url' => $asset['logo_source_url'] ?? null, 'approval_note' => is_array($asset['notes'] ?? null) ? implode(' ', $asset['notes']) : ($asset['notes'] ?? null)]);
                }
            }
        });
        $this->line(json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        return self::SUCCESS;
    }
}
