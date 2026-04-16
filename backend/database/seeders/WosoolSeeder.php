<?php
namespace Database\Seeders;

use App\Models\CompanyProfile;
use App\Models\Event;
use App\Models\FounderProfile;
use App\Models\NewsItem;
use App\Models\PartnerProfile;
use App\Models\Program;
use App\Models\Scorecard;
use App\Models\SponsorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;

class WosoolSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@wosool.org'],
            ['name' => 'Wosool Admin', 'password' => bcrypt('wosool2024!'), 'email_verified_at' => now()]
        );

        if (method_exists($admin, 'assignRole') && ! $admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $foundersData = [
            [
                'name' => 'Sara Al-Rashidi', 'email' => 'sara@example.com',
                'slug' => 'sara-al-rashidi', 'tagline' => 'Building the future of healthcare AI in the GCC',
                'bio' => 'Sara is a healthcare AI founder with 8 years of experience in digital health. Previously VP Product at a leading Saudi digital health company. Now building MedBridge to connect patients with specialized care using AI triage.',
                'location' => 'Riyadh, Saudi Arabia', 'country_code' => 'SA',
                'sector' => 'HealthTech', 'stage' => 'seed',
                'needs' => ['Healthcare partnerships', 'Series A investors', 'Clinical advisors'],
                'offers' => ['HealthTech expertise', 'Saudi MOH connections', 'Product strategy'],
                'is_featured' => true, 'is_verified' => true,
                'company' => ['name' => 'MedBridge', 'slug' => 'medbridge', 'description' => 'AI-powered healthcare navigation platform connecting patients to specialized care across the GCC.', 'sector' => 'HealthTech', 'stage' => 'seed', 'location' => 'Riyadh, Saudi Arabia', 'is_hiring' => true, 'is_fundraising' => true],
            ],
            [
                'name' => 'Khalid Al-Mansouri', 'email' => 'khalid@example.com',
                'slug' => 'khalid-al-mansouri', 'tagline' => 'Democratizing financial access for SMEs across MENA',
                'bio' => 'Khalid is a fintech entrepreneur and former investment banker with Goldman Sachs. He\'s on a mission to bring embedded finance to the underserved SME market in Saudi Arabia and the wider MENA region.',
                'location' => 'Dubai, UAE', 'country_code' => 'AE',
                'sector' => 'FinTech', 'stage' => 'series-a',
                'needs' => ['Banking partnerships', 'Regulatory guidance', 'CFO hire'],
                'offers' => ['FinTech strategy', 'MENA market access', 'Fundraising support'],
                'is_featured' => true, 'is_verified' => true,
                'company' => ['name' => 'PayFlow', 'slug' => 'payflow', 'description' => 'Embedded finance infrastructure enabling SMEs to access working capital, payments, and insurance in one platform.', 'sector' => 'FinTech', 'stage' => 'series-a', 'location' => 'Dubai, UAE', 'is_hiring' => true, 'is_fundraising' => false, 'founded_year' => 2022],
            ],
            [
                'name' => 'Nora Al-Zahrawi', 'email' => 'nora@example.com',
                'slug' => 'nora-al-zahrawi', 'tagline' => 'Transforming talent development for the Saudi Vision 2030 workforce',
                'bio' => 'Nora is an EdTech founder and former HR director passionate about upskilling the next generation of Saudi professionals. Her platform uses gamification and AI to make professional development engaging and measurable.',
                'location' => 'Jeddah, Saudi Arabia', 'country_code' => 'SA',
                'sector' => 'EdTech', 'stage' => 'seed',
                'needs' => ['Corporate sales partnerships', 'Content creators', 'LMS integrations'],
                'offers' => ['EdTech expertise', 'Saudi HR network', 'L&D consulting'],
                'is_featured' => true, 'is_verified' => true,
                'company' => ['name' => 'SkillPath', 'slug' => 'skillpath', 'description' => 'AI-powered professional development platform designed for the Arab workforce, with Arabic-first content and measurable skill outcomes.', 'sector' => 'EdTech', 'stage' => 'seed', 'location' => 'Jeddah, Saudi Arabia', 'is_hiring' => true, 'is_fundraising' => true, 'is_collaborating' => true],
            ],
            [
                'name' => 'Ahmed Al-Farsi', 'email' => 'ahmed@example.com',
                'slug' => 'ahmed-al-farsi', 'tagline' => 'Building smart logistics for the GCC e-commerce boom',
                'bio' => 'Ahmed is a logistics tech founder with deep roots in supply chain operations. After spending 6 years running logistics for a major Saudi retailer, he built LogiQ to solve last-mile delivery challenges with AI routing.',
                'location' => 'Manama, Bahrain', 'country_code' => 'BH',
                'sector' => 'LogTech', 'stage' => 'pre-seed',
                'needs' => ['Logistics partnerships', 'Seed investors', 'Operations team'],
                'offers' => ['Logistics expertise', 'GCC market knowledge', 'Operations playbooks'],
                'is_featured' => false, 'is_verified' => true,
                'company' => ['name' => 'LogiQ', 'slug' => 'logiq', 'description' => 'Smart last-mile logistics platform using AI routing and real-time optimization for GCC e-commerce.', 'sector' => 'LogTech', 'stage' => 'pre-seed', 'location' => 'Manama, Bahrain', 'is_hiring' => false, 'is_fundraising' => true, 'is_collaborating' => true],
            ],
            [
                'name' => 'Lina Al-Saud', 'email' => 'lina@example.com',
                'slug' => 'lina-al-saud', 'tagline' => 'Reimagining hospitality technology for Saudi tourism growth',
                'bio' => 'Lina is a HospTech founder and former McKinsey consultant. She\'s building Rihla to modernize hotel operations management and guest experience for the Saudi tourism mega-projects era.',
                'location' => 'Riyadh, Saudi Arabia', 'country_code' => 'SA',
                'sector' => 'HospTech', 'stage' => 'seed',
                'needs' => ['Hotel partnerships', 'Technical co-founder', 'Tourism ecosystem connections'],
                'offers' => ['Tourism market insights', 'Strategy consulting', 'NEOM/tourism ecosystem access'],
                'is_featured' => false, 'is_verified' => false,
                'company' => ['name' => 'Rihla', 'slug' => 'rihla', 'description' => 'Modern hospitality management platform built for Saudi mega-tourism projects and boutique hotels.', 'sector' => 'HospTech', 'stage' => 'seed', 'location' => 'Riyadh, Saudi Arabia', 'is_hiring' => true, 'is_collaborating' => true],
            ],
            [
                'name' => 'Omar Al-Khoury', 'email' => 'omar@example.com',
                'slug' => 'omar-al-khoury', 'tagline' => 'AI-powered legal tech for the GCC startup ecosystem',
                'bio' => 'Omar is a LegalTech founder and former startup lawyer. He built LexGCC to automate contract generation, compliance checks, and legal workflows for startups and SMEs across the GCC region.',
                'location' => 'Riyadh, Saudi Arabia', 'country_code' => 'SA',
                'sector' => 'LegalTech', 'stage' => 'pre-seed',
                'needs' => ['Legal firm partnerships', 'Angel investors', 'Product design help'],
                'offers' => ['Legal tech expertise', 'Startup law knowledge', 'GCC regulatory insights'],
                'is_featured' => false, 'is_verified' => true,
                'company' => ['name' => 'LexGCC', 'slug' => 'lexgcc', 'description' => 'AI-powered legal platform automating contract creation, compliance monitoring, and legal workflows for GCC startups.', 'sector' => 'LegalTech', 'stage' => 'pre-seed', 'location' => 'Riyadh, Saudi Arabia', 'is_hiring' => false, 'is_fundraising' => true],
            ],
        ];

        foreach ($foundersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                ['name' => $data['name'], 'password' => bcrypt('demo123!'), 'email_verified_at' => now()]
            );

            $companyData = $data['company'];
            $company = CompanyProfile::firstOrCreate(
                ['slug' => $companyData['slug']],
                array_merge($companyData, [
                    'country_code' => $data['country_code'],
                    'founded_year' => $companyData['founded_year'] ?? 2023,
                    'team_size' => rand(3, 15),
                    'is_public' => true,
                    'status' => 'active',
                    'is_hiring' => $companyData['is_hiring'] ?? false,
                    'is_fundraising' => $companyData['is_fundraising'] ?? false,
                    'is_collaborating' => $companyData['is_collaborating'] ?? false,
                ])
            );

            $founder = FounderProfile::firstOrCreate(
                ['slug' => $data['slug']],
                [
                    'user_id' => $user->id,
                    'tagline' => $data['tagline'],
                    'bio' => $data['bio'],
                    'location' => $data['location'],
                    'country_code' => $data['country_code'],
                    'sector' => $data['sector'],
                    'stage' => $data['stage'],
                    'needs' => $data['needs'],
                    'offers' => $data['offers'],
                    'is_featured' => $data['is_featured'],
                    'is_verified' => $data['is_verified'],
                    'is_public' => true,
                    'status' => 'active',
                ]
            );

            $founder->companies()->syncWithoutDetaching([$company->id => ['role' => 'Founder & CEO', 'is_primary' => true]]);

            if (method_exists($user, 'assignRole') && ! $user->hasRole('member')) {
                $user->assignRole('member');
            }

            Scorecard::firstOrCreate(
                ['founder_profile_id' => $founder->id],
                [
                    'overall_score' => rand(65, 92),
                    'profile_completeness' => rand(70, 100),
                    'community_engagement' => rand(50, 95),
                    'execution_track_record' => rand(60, 90),
                    'network_strength' => rand(55, 85),
                    'knowledge_contribution' => rand(40, 80),
                    'calculated_at' => now(),
                ]
            );
        }

        $eventsData = [
            ['title' => 'Wosool Founders Dinner — Riyadh', 'slug' => 'founders-dinner-riyadh-q2-2024', 'description' => 'An intimate dinner for Wosool founders to connect, share challenges, and build lasting relationships. Limited to 30 founders.', 'starts_at' => now()->addDays(14)->setTime(19, 0), 'ends_at' => now()->addDays(14)->setTime(22, 0), 'location' => 'The St. Regis Riyadh, Saudi Arabia', 'type' => 'wosool', 'format' => 'in-person', 'max_attendees' => 30, 'tags' => ['networking', 'dinner', 'riyadh']],
            ['title' => 'Fundraising Readiness Workshop', 'slug' => 'fundraising-readiness-workshop-april', 'description' => 'A hands-on workshop covering pitch decks, investor narratives, term sheets, and how to approach GCC VCs.', 'starts_at' => now()->addDays(7)->setTime(10, 0), 'ends_at' => now()->addDays(7)->setTime(13, 0), 'location' => 'Online', 'type' => 'wosool', 'format' => 'virtual', 'virtual_link' => 'https://meet.example.com/wosool-fundraising', 'max_attendees' => 50, 'tags' => ['fundraising', 'workshop', 'virtual']],
            ['title' => 'AI for Founders: Practical Tools & Workflows', 'slug' => 'ai-founders-tools-may', 'description' => 'Explore the most effective AI tools for founders — from customer research and product design to marketing automation.', 'starts_at' => now()->addDays(21)->setTime(14, 0), 'ends_at' => now()->addDays(21)->setTime(16, 30), 'location' => 'Online', 'type' => 'wosool', 'format' => 'virtual', 'max_attendees' => 100, 'tags' => ['ai', 'tools', 'productivity']],
            ['title' => 'GITEX Startup Stage — Wosool Meetup', 'slug' => 'gitex-wosool-meetup-2024', 'description' => 'Meet Wosool founders and members at GITEX. A casual networking session before the main event day.', 'starts_at' => now()->addDays(45)->setTime(9, 0), 'ends_at' => now()->addDays(45)->setTime(11, 0), 'location' => 'Dubai World Trade Centre, UAE', 'type' => 'partner', 'format' => 'in-person', 'max_attendees' => 60, 'tags' => ['gitex', 'networking', 'dubai']],
        ];

        foreach ($eventsData as $eventData) {
            Event::firstOrCreate(
                ['slug' => $eventData['slug']],
                array_merge($eventData, ['is_public' => true, 'requires_rsvp' => true, 'status' => 'upcoming', 'created_by' => $admin->id])
            );
        }

        $programsData = [
            ['name' => 'Founder Onboarding', 'slug' => 'founder-onboarding', 'description' => 'A structured onboarding journey to help new Wosool founders set up their profiles and make their first meaningful connections.', 'category' => 'onboarding', 'duration' => '2 weeks', 'target_stages' => ['pre-seed', 'seed'], 'cohort_size' => 20, 'benefits' => ['Platform orientation', 'Welcome call with team', 'First match introductions', 'Starter resource pack'], 'is_open' => true],
            ['name' => 'Founder Circles', 'slug' => 'founder-circles', 'description' => 'Small, curated peer groups of 6-8 founders at similar stages who meet bi-weekly. Facilitated by experienced mentors.', 'category' => 'circles', 'duration' => '3 months', 'target_stages' => ['pre-seed', 'seed', 'series-a'], 'cohort_size' => 8, 'benefits' => ['Bi-weekly peer sessions', 'Accountability partner', 'Shared playbooks', 'Expert facilitator'], 'is_open' => true],
            ['name' => 'Growth & Traction', 'slug' => 'growth-traction', 'description' => 'An intensive 6-week program focused on customer acquisition, growth metrics, and traction playbooks.', 'category' => 'growth', 'duration' => '6 weeks', 'target_stages' => ['seed', 'series-a'], 'cohort_size' => 15, 'benefits' => ['6 weekly workshops', '2x 1:1 coaching sessions', 'Growth toolkit', 'Peer accountability group'], 'is_open' => false, 'application_deadline' => now()->addDays(30)],
            ['name' => 'Fundraising Readiness', 'slug' => 'fundraising-readiness', 'description' => 'Prepare your startup for a successful fundraise. From pitch narrative and deck creation to investor targeting.', 'category' => 'fundraising', 'duration' => '4 weeks', 'target_stages' => ['seed', 'series-a'], 'cohort_size' => 12, 'benefits' => ['Pitch deck review', 'Mock investor meetings', 'Investor database access', 'Term sheet workshop'], 'is_open' => true],
        ];

        foreach ($programsData as $programData) {
            $deadline = $programData['application_deadline'] ?? null;
            unset($programData['application_deadline']);
            $program = Program::firstOrCreate(['slug' => $programData['slug']], $programData);
            if ($deadline) {
                $program->update(['application_deadline' => $deadline]);
            }
        }

        $partnersData = [
            ['name' => 'Saudi Venture Capital Company', 'slug' => 'saudi-vc', 'description' => 'Leading venture capital firm focused on the Saudi startup ecosystem.', 'type' => 'strategic', 'status' => 'ecosystem-aligned', 'sector' => 'Venture Capital', 'website' => 'https://example.com', 'display_order' => 1],
            ['name' => 'King Abdullah University of Science and Technology', 'slug' => 'kaust', 'description' => 'World-class research university and innovation ecosystem.', 'type' => 'knowledge', 'status' => 'prospective', 'sector' => 'Education & Research', 'website' => 'https://kaust.edu.sa', 'display_order' => 2],
            ['name' => 'Flat6Labs Saudi Arabia', 'slug' => 'flat6labs-ksa', 'description' => 'Leading startup accelerator running pre-seed programs in Saudi Arabia.', 'type' => 'ecosystem', 'status' => 'ecosystem-aligned', 'sector' => 'Accelerator', 'website' => 'https://flat6labs.com', 'display_order' => 3],
            ['name' => 'Endeavor Saudi Arabia', 'slug' => 'endeavor-ksa', 'description' => 'Global organization supporting high-impact entrepreneurs through mentorship and network access.', 'type' => 'community', 'status' => 'prospective', 'sector' => 'Entrepreneurship Support', 'website' => 'https://endeavor.org', 'display_order' => 4],
        ];

        foreach ($partnersData as $partnerData) {
            PartnerProfile::firstOrCreate(['slug' => $partnerData['slug']], array_merge($partnerData, ['is_public' => true]));
        }

        $sponsorsData = [
            ['name' => 'AlRajhi Capital', 'slug' => 'alrajhi-capital', 'description' => 'Leading financial institution supporting the Saudi startup ecosystem.', 'tier' => 'platinum', 'is_active' => true, 'website' => 'https://example.com', 'display_order' => 1],
            ['name' => 'STC Ventures', 'slug' => 'stc-ventures', 'description' => 'Corporate venture arm of Saudi Telecom Company, investing in technology startups across MENA.', 'tier' => 'gold', 'is_active' => true, 'website' => 'https://example.com', 'display_order' => 2],
            ['name' => 'Tamkeen Bahrain', 'slug' => 'tamkeen-bahrain', 'description' => 'Bahrain\'s leading authority for entrepreneurship development and workforce training.', 'tier' => 'silver', 'is_active' => true, 'website' => 'https://tamkeen.bh', 'display_order' => 3],
        ];

        foreach ($sponsorsData as $sponsorData) {
            SponsorProfile::firstOrCreate(['slug' => $sponsorData['slug']], $sponsorData);
        }

        $newsData = [
            ['title' => 'Wosool Launches Q2 2024 Founder Circle Cohort', 'slug' => 'wosool-q2-founder-circle-launch', 'excerpt' => 'We are excited to welcome 32 new founders to the Q2 Founder Circle cohort — our most diverse group yet.', 'category' => 'announcement', 'author_name' => 'Wosool Team', 'is_featured' => true, 'status' => 'published', 'published_at' => now()->subDays(3), 'tags' => ['circles', 'cohort', 'community']],
            ['title' => 'MedBridge Closes SAR 5M Seed Round with KAUST Investment', 'slug' => 'medbridge-seed-round-kaust', 'excerpt' => 'Wosool founder Sara Al-Rashidi\'s MedBridge has announced a SAR 5M seed round co-led by KAUST Innovation Fund.', 'category' => 'company-milestone', 'author_name' => 'Wosool Editorial', 'is_featured' => true, 'status' => 'published', 'published_at' => now()->subDays(7), 'tags' => ['funding', 'healthtech', 'saudi']],
            ['title' => 'PayFlow Expands to Kuwait and Bahrain Markets', 'slug' => 'payflow-gcc-expansion', 'excerpt' => 'Dubai-based FinTech startup PayFlow has officially launched in Kuwait and Bahrain.', 'category' => 'company-milestone', 'author_name' => 'Wosool Editorial', 'is_featured' => false, 'status' => 'published', 'published_at' => now()->subDays(12), 'tags' => ['fintech', 'expansion', 'gcc']],
            ['title' => 'Recap: Saudi Startup Ecosystem Report 2024', 'slug' => 'saudi-startup-ecosystem-report-2024', 'excerpt' => 'The latest data shows Saudi Arabia\'s startup ecosystem grew 45% in investment volume in 2023.', 'category' => 'editorial', 'author_name' => 'Wosool Research Team', 'is_featured' => false, 'status' => 'published', 'published_at' => now()->subDays(18), 'tags' => ['research', 'ecosystem', 'saudi']],
            ['title' => 'Upcoming: Wosool Founders Dinner — Riyadh April Edition', 'slug' => 'founders-dinner-riyadh-april-preview', 'excerpt' => 'We are hosting an intimate dinner for 30 Wosool founders in Riyadh.', 'category' => 'announcement', 'author_name' => 'Wosool Team', 'is_featured' => false, 'status' => 'published', 'published_at' => now()->subDays(2), 'tags' => ['events', 'networking', 'riyadh']],
            ['title' => 'How Wosool Members Are Using AI in Their Startups', 'slug' => 'wosool-founders-ai-usage', 'excerpt' => 'A roundup of the most impactful AI tools and workflows Wosool founders are using to accelerate their growth.', 'category' => 'editorial', 'author_name' => 'Wosool Editorial', 'is_featured' => false, 'status' => 'published', 'published_at' => now()->subDays(5), 'tags' => ['ai', 'tools', 'growth']],
        ];

        foreach ($newsData as $newsItemData) {
            NewsItem::firstOrCreate(['slug' => $newsItemData['slug']], array_merge($newsItemData, ['is_public' => true]));
        }

        $this->command->info('✅ Wosool seed data created successfully!');
    }
}
