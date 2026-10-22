import type { Entrepreneur, EntrepreneurFilters } from "@/types/entrepreneur"

/**
 * Fictional entrepreneur directory seed data.
 *
 * Every profile below is entirely fictional. No real people, real startups,
 * or real photos are referenced. Avatars are rendered as deterministic
 * cartoon illustrations driven by the explicit `gender` field.
 */
export const entrepreneurs: Entrepreneur[] = [
  // ────────────────────────────── Saudi Arabia (25) ──────────────────────────────
  {
    id: "ent-001",
    firstName: "Salman",
    familyName: "Alharbi",
    fullName: "Salman Alharbi",
    gender: "male",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "AI",
    startupName: "Mudrik AI",
    startupStage: "Series A",
    businessModel: "B2B SaaS subscription",
    description:
      "Mudrik AI builds Arabic-first AI copilots that automate back-office work for small and medium businesses, from drafting supplier emails to reconciling purchase orders in local dialects.",
    shortBio:
      "Former enterprise software architect who left a corporate role to make AI genuinely useful for Arabic-speaking SMEs.",
    problemSolved:
      "Most AI productivity tools perform poorly in Arabic and ignore regional business workflows, leaving SMEs stuck with manual paperwork.",
    solution:
      "A suite of fine-tuned Arabic language models embedded into accounting, procurement, and customer-service workflows with one-click automations.",
    targetCustomers: ["SME owners", "Operations managers", "Accounting teams"],
    traction: "1,400 paying SME workspaces and 3x year-over-year revenue growth.",
    fundingNeed: "Raising a SAR 45M Series A extension to expand the model training team and launch in two new GCC markets.",
    tags: ["AI", "Arabic NLP", "SME automation", "B2B SaaS"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-002",
    firstName: "Noura",
    familyName: "Alharbi",
    fullName: "Noura Alharbi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "HealthTech",
    startupName: "Aafiya Care",
    startupStage: "Series A",
    businessModel: "B2B2C platform licensed to hospital groups",
    description:
      "Aafiya Care is a patient navigation platform that guides chronic-disease patients through appointments, referrals, medication schedules, and insurance approvals in one bilingual app.",
    shortBio:
      "Former hospital operations director who saw patients get lost between departments and decided to fix the journey itself.",
    problemSolved:
      "Chronic patients juggle fragmented appointments, paper referrals, and confusing insurance steps, leading to missed care and worse outcomes.",
    solution:
      "A care-coordination layer that connects hospital systems, insurers, and patients with automated reminders, referral tracking, and Arabic/English health guidance.",
    targetCustomers: ["Hospital groups", "Health insurers", "Chronic-disease patients"],
    traction: "Deployed across 9 hospitals with 220,000 registered patients and a 31% drop in missed appointments.",
    fundingNeed: "Raising Series A capital to add AI triage and expand to primary-care networks across the Gulf.",
    tags: ["HealthTech", "Patient experience", "Care coordination", "B2B2C"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-003",
    firstName: "Faisal",
    familyName: "Alqahtani",
    fullName: "Faisal Alqahtani",
    gender: "male",
    country: "Saudi Arabia",
    city: "Jeddah",
    region: "GCC",
    sector: "FinTech",
    startupName: "Qeem Pay",
    startupStage: "Seed",
    businessModel: "Transaction fees on B2B payments",
    description:
      "Qeem Pay digitizes supplier payments for wholesale traders, replacing cheques and bank-branch visits with instant B2B transfers, e-invoices, and automatic reconciliation.",
    shortBio:
      "Second-generation trading-family operator who grew up watching cash-flow chaos in Jeddah's wholesale districts.",
    problemSolved:
      "Wholesale merchants still settle large supplier invoices with cheques and manual ledgers, causing payment delays and reconciliation errors.",
    solution:
      "A B2B payments rail with embedded e-invoicing, buyer credit terms, and ERP-friendly reconciliation built for trading businesses.",
    targetCustomers: ["Wholesale traders", "Distributors", "Import/export firms"],
    traction: "SAR 180M in annualized payment volume across 850 merchant accounts.",
    fundingNeed: "Seeking seed extension to obtain additional payment licensing and build supplier financing.",
    tags: ["FinTech", "B2B payments", "E-invoicing", "SME finance"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-004",
    firstName: "Sara",
    familyName: "Alqahtani",
    fullName: "Sara Alqahtani",
    gender: "female",
    country: "Saudi Arabia",
    city: "Jeddah",
    region: "GCC",
    sector: "EdTech",
    startupName: "Murtaqa Learning",
    startupStage: "Seed",
    businessModel: "School licensing plus family subscriptions",
    description:
      "Murtaqa Learning delivers adaptive STEM courses in Arabic, adjusting difficulty in real time so every student gets a personalized path through math and science.",
    shortBio:
      "Former physics teacher and curriculum designer obsessed with why capable students fall behind in standardized classrooms.",
    problemSolved:
      "Arabic-speaking students lack adaptive STEM content, so classrooms teach to the middle and both struggling and gifted students disengage.",
    solution:
      "An adaptive learning engine with Arabic-first STEM content, teacher dashboards, and mastery-based progression aligned to national curricula.",
    targetCustomers: ["K-12 schools", "Parents", "Tutoring centers"],
    traction: "74 partner schools and 60,000 monthly active students with 22% average score improvement.",
    fundingNeed: "Raising seed round to expand science labs simulations and enter Gulf school networks.",
    tags: ["EdTech", "Adaptive learning", "STEM", "Arabic content"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-005",
    firstName: "Abdulaziz",
    familyName: "Alotaibi",
    fullName: "Abdulaziz Alotaibi",
    gender: "male",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "Cybersecurity",
    startupName: "Hasin Security",
    startupStage: "Seed",
    businessModel: "Annual enterprise licensing",
    description:
      "Hasin Security monitors operational technology networks in factories and utilities, detecting anomalies in industrial control systems before they become safety incidents.",
    shortBio:
      "Industrial control engineer turned security founder after responding to a plant-floor malware incident early in his career.",
    problemSolved:
      "Industrial plants run decades-old control systems that IT security tools cannot see, leaving critical infrastructure exposed.",
    solution:
      "Passive OT network sensors with protocol-aware threat detection and a bilingual incident console built for plant engineers, not just security analysts.",
    targetCustomers: ["Manufacturing plants", "Utilities", "Industrial cities operators"],
    traction: "14 industrial sites under continuous monitoring including two national-scale utilities pilots.",
    fundingNeed: "Raising seed capital to certify against regional OT security frameworks and double the detection engineering team.",
    tags: ["Cybersecurity", "OT security", "Critical infrastructure", "Industrial IoT"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-006",
    firstName: "Reem",
    familyName: "Alotaibi",
    fullName: "Reem Alotaibi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "Digital Identity",
    startupName: "Ithbat ID",
    startupStage: "Pre-Seed",
    businessModel: "Per-verification API pricing",
    description:
      "Ithbat ID is a reusable digital identity wallet that lets users complete KYC once and share verified credentials with banks, fintechs, and marketplaces in seconds.",
    shortBio:
      "Former compliance analyst who processed thousands of repetitive KYC files and knew there had to be a reusable answer.",
    problemSolved:
      "Every financial app forces users through the same document uploads and selfie checks, creating drop-off for businesses and friction for customers.",
    solution:
      "A consent-based credential wallet with bank-grade verification, liveness checks, and one-tap sharing that cuts onboarding from days to minutes.",
    targetCustomers: ["Digital banks", "Fintech apps", "Online marketplaces"],
    traction: "Two fintech pilot integrations and 18,000 verified wallet users in closed beta.",
    fundingNeed: "Raising pre-seed to complete regulatory sandbox participation and harden the credential infrastructure.",
    tags: ["Digital Identity", "KYC", "Verifiable credentials", "RegTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-007",
    firstName: "Nawaf",
    familyName: "Alghamdi",
    fullName: "Nawaf Alghamdi",
    gender: "male",
    country: "Saudi Arabia",
    city: "Dammam",
    region: "GCC",
    sector: "Logistics",
    startupName: "Masar Freight",
    startupStage: "Series A",
    businessModel: "Marketplace take rate on freight bookings",
    description:
      "Masar Freight is a digital freight marketplace matching shippers with vetted truckers on port-to-warehouse lanes, with live tracking and instant driver payouts.",
    shortBio:
      "Grew up around his family's trucking yard in Dammam and digitized the dispatch board he used to update by hand.",
    problemSolved:
      "Port freight is booked through phone-call brokers, leaving shippers blind to truck location and drivers waiting weeks for payment.",
    solution:
      "An instant-booking marketplace with GPS tracking, digital proof of delivery, and same-day driver settlement across eastern seaport corridors.",
    targetCustomers: ["Importers", "Freight forwarders", "Owner-operator truckers"],
    traction: "38,000 completed loads and a network of 5,200 verified drivers.",
    fundingNeed: "Series A to expand into cross-border GCC lanes and launch fuel-advance financing for drivers.",
    tags: ["Logistics", "Freight marketplace", "Trucking", "Supply chain"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-008",
    firstName: "Layan",
    familyName: "Alghamdi",
    fullName: "Layan Alghamdi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Jeddah",
    region: "GCC",
    sector: "Creator Economy",
    startupName: "Sanaa Collective",
    startupStage: "MVP",
    businessModel: "Revenue share on creator monetization tools",
    description:
      "Sanaa Collective gives Arabic-language creators a storefront, membership tiers, and brand-deal management in one dashboard built for regional payment methods.",
    shortBio:
      "Ex-media agency strategist who managed creator campaigns and watched talented creators lose income to spreadsheets and unpaid invoices.",
    problemSolved:
      "Arab creators stitch together foreign tools that lack local payments, Arabic interfaces, and regional brand-deal norms.",
    solution:
      "An all-in-one monetization hub with local payment rails, contract templates, and audience analytics tailored to Arabic content niches.",
    targetCustomers: ["Content creators", "Podcast networks", "Talent agencies"],
    traction: "900 creators onboarded in beta processing SAR 2.1M in fan and brand payments.",
    fundingNeed: "Pre-seed top-up to launch mobile apps and automated brand-matching.",
    tags: ["Creator Economy", "Monetization", "Local payments", "Media"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-009",
    firstName: "Rakan",
    familyName: "Alsubaie",
    fullName: "Rakan Alsubaie",
    gender: "male",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "Smart Cities",
    startupName: "Omran Grid",
    startupStage: "Pre-Seed",
    businessModel: "Municipal SaaS licensing",
    description:
      "Omran Grid is a smart city operations platform that fuses IoT sensor feeds, maintenance tickets, and contractor performance into a single command view for city districts.",
    shortBio:
      "Urban systems engineer who managed district infrastructure projects and grew frustrated with siloed dashboards.",
    problemSolved:
      "City operations teams monitor lighting, waste, and road assets through disconnected vendor dashboards, slowing response to resident complaints.",
    solution:
      "A vendor-neutral operations layer that unifies sensor data and work orders with SLA scoring for maintenance contractors.",
    targetCustomers: ["Municipalities", "District developers", "Facilities contractors"],
    traction: "One district-scale pilot covering 12,000 connected assets.",
    fundingNeed: "Pre-seed round to complete the integration marketplace and win two additional city pilots.",
    tags: ["Smart Cities", "IoT", "Urban operations", "GovTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-010",
    firstName: "Dana",
    familyName: "Alsubaie",
    fullName: "Dana Alsubaie",
    gender: "female",
    country: "Saudi Arabia",
    city: "Khobar",
    region: "GCC",
    sector: "RetailTech",
    startupName: "Raff Retail",
    startupStage: "Seed",
    businessModel: "Per-store SaaS subscription",
    description:
      "Raff Retail uses shelf-mounted cameras and computer vision to alert grocery managers about out-of-stock items, planogram violations, and expiry risks in real time.",
    shortBio:
      "Former FMCG key-account manager who audited hundreds of store shelves by clipboard and built the tool she wished existed.",
    problemSolved:
      "Grocery chains lose significant revenue to empty shelves and misplaced products that staff only discover during manual walkthroughs.",
    solution:
      "Low-cost vision sensors with on-device inference that turn every aisle into a live inventory signal integrated with replenishment systems.",
    targetCustomers: ["Grocery chains", "Convenience stores", "FMCG distributors"],
    traction: "Deployed in 120 stores with a measured 4.5% uplift in shelf availability.",
    fundingNeed: "Seed round to scale hardware manufacturing and sign two national retail chains.",
    tags: ["RetailTech", "Computer vision", "Inventory", "FMCG"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-011",
    firstName: "Bader",
    familyName: "Almutairi",
    fullName: "Bader Almutairi",
    gender: "male",
    country: "Saudi Arabia",
    city: "Buraidah",
    region: "GCC",
    sector: "AgriTech",
    startupName: "Wafrah Farms",
    startupStage: "MVP",
    businessModel: "Hardware-as-a-service with data subscription",
    description:
      "Wafrah Farms installs soil-moisture probes and weather microstations on date farms, then schedules irrigation automatically to cut water use without hurting yield.",
    shortBio:
      "Agricultural engineer from a Qassim farming family determined to protect groundwater while keeping farms profitable.",
    problemSolved:
      "Date farmers irrigate on fixed schedules, over-pumping scarce groundwater and inflating diesel and electricity costs.",
    solution:
      "Irrigation intelligence combining soil sensors, evapotranspiration models, and automated valve control tuned for date-palm agronomy.",
    targetCustomers: ["Date farm owners", "Agricultural cooperatives", "Farm management companies"],
    traction: "41 farms live with an average 28% reduction in water consumption.",
    fundingNeed: "Bridge funding to localize sensor assembly and expand to olive and citrus growers.",
    tags: ["AgriTech", "Water efficiency", "IoT sensors", "Precision farming"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-012",
    firstName: "Hessa",
    familyName: "Almutairi",
    fullName: "Hessa Almutairi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "PropTech",
    startupName: "Diar Analytics",
    startupStage: "Seed",
    businessModel: "Subscription analytics plus screening fees",
    description:
      "Diar Analytics helps residential landlords price units with hyperlocal rent benchmarks and screen tenants through verified income and rental-history checks.",
    shortBio:
      "Former real-estate fund analyst who valued thousands of units and saw how little data individual landlords actually use.",
    problemSolved:
      "Small landlords set rents by guesswork and accept tenants with no reliable history, causing vacancies and payment disputes.",
    solution:
      "A pricing engine built on granular lease data paired with consent-based tenant screening and digital lease workflows.",
    targetCustomers: ["Individual landlords", "Property managers", "Real-estate brokerages"],
    traction: "9,000 units priced monthly and 3 brokerage partnerships signed.",
    fundingNeed: "Seed capital to expand data coverage to five more cities and launch landlord financial tools.",
    tags: ["PropTech", "Rental analytics", "Tenant screening", "Real estate data"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-013",
    firstName: "Saud",
    familyName: "Alshammari",
    fullName: "Saud Alshammari",
    gender: "male",
    country: "Saudi Arabia",
    city: "Hail",
    region: "GCC",
    sector: "SpaceTech",
    startupName: "Falak Orbit",
    startupStage: "Prototype",
    businessModel: "Ground-station-as-a-service contracts",
    description:
      "Falak Orbit is building a network of desert ground stations that let small-satellite operators downlink data over the Arabian Peninsula without building their own antennas.",
    shortBio:
      "RF engineer and amateur radio astronomer who prototyped his first satellite dish array on family land outside Hail.",
    problemSolved:
      "Small-sat operators face long data-latency gaps over the Middle East because affordable ground-station coverage in the region is scarce.",
    solution:
      "Distributed low-cost antenna stations with API-based pass scheduling, offering regional downlink capacity at a fraction of legacy pricing.",
    targetCustomers: ["Cubesat operators", "Earth-observation companies", "Space research programs"],
    traction: "Two operational prototype stations completing 40 satellite passes weekly.",
    fundingNeed: "Prototype-to-production funding for five additional stations and spectrum licensing.",
    tags: ["SpaceTech", "Ground stations", "Satellite data", "Infrastructure"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-014",
    firstName: "Jawaher",
    familyName: "Alshammari",
    fullName: "Jawaher Alshammari",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "Blockchain Infrastructure",
    startupName: "Silsilah Labs",
    startupStage: "Prototype",
    businessModel: "Protocol licensing and node services",
    description:
      "Silsilah Labs builds permissioned ledger infrastructure for trade-finance consortia, letting banks and corporates share document status without exposing sensitive data.",
    shortBio:
      "Distributed-systems engineer who previously built settlement software and believes trade paperwork is blockchain's most practical use case.",
    problemSolved:
      "Letters of credit and trade documents crawl between banks by courier and email, adding weeks and fraud risk to regional trade.",
    solution:
      "A permissioned ledger with zero-knowledge document proofs so counterparties verify authenticity instantly while data stays private.",
    targetCustomers: ["Trade-finance banks", "Large importers", "Customs brokers"],
    traction: "Consortium pilot with three financial institutions processing test letters of credit.",
    fundingNeed: "Raising to complete security audits and move the consortium pilot into production.",
    tags: ["Blockchain Infrastructure", "Trade finance", "Zero-knowledge proofs", "Enterprise"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-015",
    firstName: "Majed",
    familyName: "Alzahrani",
    fullName: "Majed Alzahrani",
    gender: "male",
    country: "Saudi Arabia",
    city: "Abha",
    region: "GCC",
    sector: "TourismTech",
    startupName: "Wijhah Trails",
    startupStage: "Seed",
    businessModel: "Commission on bookings plus DMC SaaS",
    description:
      "Wijhah Trails turns highland tourism into bookable itineraries, packaging local guides, farm stays, and hiking routes with dynamic weather-aware scheduling.",
    shortBio:
      "Abha native and former tour guide who mapped the Aseer mountains on foot before turning the routes into a platform.",
    problemSolved:
      "Mountain and heritage experiences are scattered across WhatsApp groups, making trips hard to plan and leaving local hosts undiscovered.",
    solution:
      "An itinerary engine that composes multi-day trips from vetted local experiences with instant booking and route logistics.",
    targetCustomers: ["Domestic tourists", "Adventure travelers", "Destination management companies"],
    traction: "17,000 booked experiences across two tourism seasons and 260 local host partners.",
    fundingNeed: "Seed round to onboard three more regions and build group-trip planning tools.",
    tags: ["TourismTech", "Itinerary planning", "Local experiences", "Marketplace"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-016",
    firstName: "Ghadah",
    familyName: "Alzahrani",
    fullName: "Ghadah Alzahrani",
    gender: "female",
    country: "Saudi Arabia",
    city: "Madinah",
    region: "GCC",
    sector: "TourismTech",
    startupName: "Zad Journeys",
    startupStage: "MVP",
    businessModel: "Freemium app with premium concierge tiers",
    description:
      "Zad Journeys is a multilingual companion app for religious and cultural visitors, handling crowd-aware scheduling, accessibility routing, and family coordination.",
    shortBio:
      "Hospitality operations manager who served millions of visitors and wanted technology that respects both logistics and spiritual experience.",
    problemSolved:
      "First-time visitors struggle with crowd timing, navigation, and language barriers, especially elderly travelers and families with special needs.",
    solution:
      "Personalized visit plans using live crowd signals, step-free routing, and eleven-language guidance with family location sharing.",
    targetCustomers: ["International visitors", "Tour operators", "Elderly and accessibility-focused travelers"],
    traction: "130,000 app downloads and partnerships with 12 licensed tour operators.",
    fundingNeed: "Raising to scale infrastructure ahead of peak seasons and deepen operator integrations.",
    tags: ["TourismTech", "Accessibility", "Multilingual", "Consumer app"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-017",
    firstName: "Khalid",
    familyName: "Alanzi",
    fullName: "Khalid Alanzi",
    gender: "male",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "GovTech",
    startupName: "Ejraat",
    startupStage: "MVP",
    businessModel: "Government SaaS contracts",
    description:
      "Ejraat digitizes municipal permit workflows end to end, giving applicants live status tracking and giving officials configurable approval pipelines with audit trails.",
    shortBio:
      "Former e-government consultant who implemented digital services for public entities and decided to productize the patterns.",
    problemSolved:
      "Municipal permits still involve repeated office visits and opaque status checks, frustrating businesses and overloading counter staff.",
    solution:
      "A no-code workflow builder for permit types with integrated document verification, fee payment, and inspector scheduling.",
    targetCustomers: ["Municipalities", "Government service centers", "Business license applicants"],
    traction: "Two municipal deployments processing 3,000 permit applications monthly.",
    fundingNeed: "Growth funding to meet public-sector certification requirements and scale delivery teams.",
    tags: ["GovTech", "Digital permits", "Workflow automation", "Public sector"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-018",
    firstName: "Munirah",
    familyName: "Alanzi",
    fullName: "Munirah Alanzi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Jubail",
    region: "GCC",
    sector: "ClimateTech",
    startupName: "Nafas Industrial",
    startupStage: "Pre-Seed",
    businessModel: "Monitoring subscription per facility",
    description:
      "Nafas Industrial gives petrochemical and manufacturing plants continuous emissions monitoring with automated regulatory reporting and leak-source localization.",
    shortBio:
      "Environmental engineer who ran compliance audits in industrial cities and saw how manual sampling misses real emission events.",
    problemSolved:
      "Plants rely on periodic manual emissions sampling, missing intermittent leaks and scrambling during regulatory inspections.",
    solution:
      "Fixed and drone-mounted sensors with dispersion modeling that pinpoint leak sources and generate inspection-ready compliance reports.",
    targetCustomers: ["Petrochemical plants", "Industrial city authorities", "ESG compliance teams"],
    traction: "Paid pilot with one industrial operator monitoring 3 production units.",
    fundingNeed: "Pre-seed to certify sensors and expand the pilot to full-facility coverage.",
    tags: ["ClimateTech", "Emissions monitoring", "Industrial ESG", "Sensors"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-019",
    firstName: "Yazeed",
    familyName: "Aldosari",
    fullName: "Yazeed Aldosari",
    gender: "male",
    country: "Saudi Arabia",
    city: "Khobar",
    region: "GCC",
    sector: "Robotics",
    startupName: "Sanad Robotics",
    startupStage: "Prototype",
    businessModel: "Robotics-as-a-service inspection contracts",
    description:
      "Sanad Robotics builds crawler robots that inspect pipelines and storage tanks from the inside, replacing scaffolding, shutdowns, and confined-space entry.",
    shortBio:
      "Mechatronics engineer who spent years scheduling risky manual tank inspections and started building robots to end them.",
    problemSolved:
      "Tank and pipeline inspections require shutdowns and human entry into hazardous confined spaces, costing millions in downtime.",
    solution:
      "Magnetic crawler robots with ultrasonic thickness sensors and AI defect classification that inspect assets while they remain in service.",
    targetCustomers: ["Oil and gas operators", "Water utilities", "Inspection service firms"],
    traction: "Completed 6 field trials with two industrial services partners.",
    fundingNeed: "Hardware funding to build a five-robot fleet and obtain industrial certifications.",
    tags: ["Robotics", "Industrial inspection", "Asset integrity", "AI"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-020",
    firstName: "Lama",
    familyName: "Aldosari",
    fullName: "Lama Aldosari",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "AI",
    startupName: "Lisan Analytics",
    startupStage: "Seed",
    businessModel: "Usage-based API and enterprise plans",
    description:
      "Lisan Analytics analyzes customer calls in Gulf Arabic dialects, surfacing complaint themes, agent coaching moments, and churn signals for contact centers.",
    shortBio:
      "Computational linguist who built dialect corpora during her graduate work and turned the research into a product.",
    problemSolved:
      "Speech analytics tools misunderstand Gulf dialects, so contact centers manually sample fewer than 2% of calls and miss systemic issues.",
    solution:
      "Dialect-tuned speech recognition and intent models that score 100% of calls with Arabic-native sentiment and compliance detection.",
    targetCustomers: ["Bank contact centers", "Telecom operators", "Customer-experience teams"],
    traction: "Processing 1.2M call minutes monthly for 6 enterprise clients.",
    fundingNeed: "Seed round to expand dialect coverage and build real-time agent assist.",
    tags: ["AI", "Speech analytics", "Gulf dialects", "Customer experience"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-021",
    firstName: "Turki",
    familyName: "Alshehri",
    fullName: "Turki Alshehri",
    gender: "male",
    country: "Saudi Arabia",
    city: "Jeddah",
    region: "GCC",
    sector: "MediaTech",
    startupName: "Sard Studios",
    startupStage: "Seed",
    businessModel: "Subscription streaming plus licensing",
    description:
      "Sard Studios produces and streams original Arabic audio dramas and serialized podcasts, pairing regional writers with a slick bingeable listening app.",
    shortBio:
      "Radio producer turned founder betting that Arabic storytelling deserves premium production and a platform of its own.",
    problemSolved:
      "Arabic listeners have huge appetite for audio fiction but the catalogs are thin, scattered, and poorly produced.",
    solution:
      "A studio-plus-platform model producing exclusive audio series with data-driven greenlighting and offline-first mobile apps.",
    targetCustomers: ["Arabic-speaking listeners", "Commuters", "Audio advertisers"],
    traction: "48 original series, 350,000 monthly listeners, and two brand-sponsored productions.",
    fundingNeed: "Seed capital to triple original content output and launch family-friendly kids programming.",
    tags: ["MediaTech", "Audio content", "Arabic storytelling", "Subscription"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-022",
    firstName: "Fahad",
    familyName: "Albaqami",
    fullName: "Fahad Albaqami",
    gender: "male",
    country: "Saudi Arabia",
    city: "Taif",
    region: "GCC",
    sector: "ClimateTech",
    startupName: "Hima Climate",
    startupStage: "Idea",
    businessModel: "Risk-analytics SaaS for asset owners",
    description:
      "Hima Climate is designing climate risk dashboards that model heat stress, flash-flood exposure, and dust-storm impact for infrastructure and real-estate portfolios.",
    shortBio:
      "Civil engineer and climate-data hobbyist who watched flash floods reshape project budgets and believes risk should be priced upfront.",
    problemSolved:
      "Developers and asset owners in arid regions lack localized climate risk models, so extreme-weather losses arrive as surprises.",
    solution:
      "High-resolution regional climate models translated into asset-level risk scores, adaptation recommendations, and insurance-ready reports.",
    targetCustomers: ["Real-estate developers", "Infrastructure funds", "Insurers"],
    traction: "Validated methodology with two academic partners; first pilot letter of intent signed.",
    fundingNeed: "Idea-stage backing to build the founding data-science team and ship the first dashboard.",
    tags: ["ClimateTech", "Risk analytics", "Climate modeling", "Infrastructure"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-023",
    firstName: "Meshari",
    familyName: "Alruwaili",
    fullName: "Meshari Alruwaili",
    gender: "male",
    country: "Saudi Arabia",
    city: "Tabuk",
    region: "GCC",
    sector: "Geospatial Intelligence",
    startupName: "Ard Analytics",
    startupStage: "MVP",
    businessModel: "Per-site monitoring subscriptions",
    description:
      "Ard Analytics tracks mega-project construction progress from satellite and drone imagery, flagging schedule slippage and earthwork volumes automatically.",
    shortBio:
      "Surveying engineer from the northwest who traded total stations for satellites after mapping giga-project sites by hand.",
    problemSolved:
      "Construction owners rely on contractor self-reporting for progress, discovering delays months late on remote large-scale sites.",
    solution:
      "Automated change detection on frequent satellite imagery with volumetric analysis, giving owners an independent weekly progress signal.",
    targetCustomers: ["Project owners", "Construction lenders", "Program management consultants"],
    traction: "Monitoring 7 active construction sites totaling 90 square kilometers.",
    fundingNeed: "Raising to automate the analysis pipeline and add underground-utilities detection.",
    tags: ["Geospatial Intelligence", "Construction monitoring", "Satellite imagery", "Analytics"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-024",
    firstName: "Wejdan",
    familyName: "Almalki",
    fullName: "Wejdan Almalki",
    gender: "female",
    country: "Saudi Arabia",
    city: "Makkah",
    region: "GCC",
    sector: "Logistics",
    startupName: "Imdad Events",
    startupStage: "Idea",
    businessModel: "Surge-logistics marketplace commission",
    description:
      "Imdad Events is designing surge logistics for seasonal mega-events, pooling on-demand warehouse space, refrigerated trucks, and trained crews for peak weeks.",
    shortBio:
      "Supply-chain planner who managed catering logistics during peak seasons and saw the same capacity crunch every single year.",
    problemSolved:
      "Event and hospitality operators face extreme seasonal demand spikes but logistics capacity is booked ad hoc at panic prices.",
    solution:
      "A pre-committed capacity pool with dynamic pricing that matches seasonal demand to idle regional logistics assets months in advance.",
    targetCustomers: ["Event operators", "Catering companies", "Hospitality groups"],
    traction: "Completed 30 operator interviews and secured two letters of intent for next season.",
    fundingNeed: "Idea-stage funding to build the booking platform and sign anchor capacity partners.",
    tags: ["Logistics", "Events", "Seasonal capacity", "Marketplace"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-025",
    firstName: "Shahad",
    familyName: "Alnajdi",
    fullName: "Shahad Alnajdi",
    gender: "female",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "GCC",
    sector: "HealthTech",
    startupName: "Wared Health",
    startupStage: "MVP",
    businessModel: "Subscription telecare with insurer partnerships",
    description:
      "Wared Health is a women's health platform offering discreet teleconsultations, cycle-linked wellness plans, and postpartum support programs in Arabic.",
    shortBio:
      "Public-health specialist focused on closing the gap between women's health needs and the services actually available to them.",
    problemSolved:
      "Women delay seeking care for hormonal, fertility, and postpartum concerns due to access friction and limited specialized services.",
    solution:
      "Licensed specialist consultations with structured care programs, symptom tracking, and pharmacy delivery in one private app.",
    targetCustomers: ["Women aged 18-45", "New mothers", "Employers offering health benefits"],
    traction: "26,000 registered users and 4,100 completed consultations in the first two quarters.",
    fundingNeed: "Raising to add insurance billing integrations and expand the specialist network.",
    tags: ["HealthTech", "Women's health", "Telemedicine", "Consumer health"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },

  // ────────────────────────────── GCC (15) ──────────────────────────────
  {
    id: "ent-026",
    firstName: "Hamdan",
    familyName: "Alnuaimi",
    fullName: "Hamdan Alnuaimi",
    gender: "male",
    country: "United Arab Emirates",
    city: "Dubai",
    region: "GCC",
    sector: "FinTech",
    startupName: "FloosLink",
    startupStage: "Series A",
    businessModel: "FX spread and API fees",
    description:
      "FloosLink is a remittance orchestration platform that routes worker remittances through the cheapest compliant corridor in real time across 30 receiving markets.",
    shortBio:
      "Payments infrastructure veteran who built settlement systems at a regional exchange house before founding FloosLink.",
    problemSolved:
      "Remittance providers hard-code single banking partners per corridor, passing high fees and slow settlement on to migrant workers.",
    solution:
      "A smart-routing layer that benchmarks corridors live and switches rails automatically while handling compliance screening centrally.",
    targetCustomers: ["Exchange houses", "Digital wallets", "Employers running payroll remittance"],
    traction: "USD 400M annualized routed volume with 12 licensed partners.",
    fundingNeed: "Series A to add six African and Southeast Asian corridors and pursue additional regulatory approvals.",
    tags: ["FinTech", "Remittances", "Payments infrastructure", "Cross-border"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-027",
    firstName: "Mariam",
    familyName: "Alfalasi",
    fullName: "Mariam Alfalasi",
    gender: "female",
    country: "United Arab Emirates",
    city: "Dubai",
    region: "GCC",
    sector: "SpaceTech",
    startupName: "Midar Space",
    startupStage: "Seed",
    businessModel: "Data-as-a-service subscriptions",
    description:
      "Midar Space converts multispectral satellite imagery into crop-health and water-stress maps tailored for desert agriculture and greening programs.",
    shortBio:
      "Remote-sensing scientist who analyzed satellite data for environmental agencies and saw farmers priced out of the insights.",
    problemSolved:
      "Desert agriculture operators cannot afford bespoke satellite analysis, so irrigation and planting decisions ignore available orbital data.",
    solution:
      "Pre-processed, agronomy-calibrated satellite insights delivered as simple weekly maps and alerts priced per hectare.",
    targetCustomers: ["Desert farms", "Afforestation programs", "Agricultural ministries"],
    traction: "220,000 hectares under weekly monitoring across three countries.",
    fundingNeed: "Seed round to launch a tasking partnership for higher-resolution imagery and expand the agronomy team.",
    tags: ["SpaceTech", "Earth observation", "AgriTech", "Remote sensing"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-028",
    firstName: "Saif",
    familyName: "Almazrouei",
    fullName: "Saif Almazrouei",
    gender: "male",
    country: "United Arab Emirates",
    city: "Abu Dhabi",
    region: "GCC",
    sector: "GovTech",
    startupName: "Muyassar Gov",
    startupStage: "Growth",
    businessModel: "Enterprise government licensing",
    description:
      "Muyassar Gov provides an AI service assistant that lets residents complete government transactions through natural conversation in Arabic and English.",
    shortBio:
      "Former digital-government program director who shipped national service portals and now builds the conversational layer above them.",
    problemSolved:
      "Government portals list thousands of services but residents still struggle to find the right one and complete multi-step transactions.",
    solution:
      "A conversational AI that understands intent, pre-fills applications from verified data, and executes transactions across agency APIs.",
    targetCustomers: ["Government digital agencies", "Smart city authorities", "Semi-government service providers"],
    traction: "Live with four government entities handling 900,000 conversations per quarter.",
    fundingNeed: "Growth round to expand internationally to governments across Asia and Africa.",
    tags: ["GovTech", "Conversational AI", "Digital services", "Enterprise"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-029",
    firstName: "Abdullah",
    familyName: "Alrashidi",
    fullName: "Abdullah Alrashidi",
    gender: "male",
    country: "Kuwait",
    city: "Kuwait City",
    region: "GCC",
    sector: "Logistics",
    startupName: "Sareea Logistics",
    startupStage: "Seed",
    businessModel: "Per-delivery pricing with SaaS tiers",
    description:
      "Sareea Logistics orchestrates last-mile delivery for restaurants and retailers, pooling couriers across brands to cut idle time and delivery costs.",
    shortBio:
      "Ex-operations lead at a food-delivery company who saw how much courier capacity sits wasted between order peaks.",
    problemSolved:
      "Each retail brand contracts its own courier fleet, resulting in idle drivers, surge failures, and expensive deliveries.",
    solution:
      "A shared courier network with intelligent batching, cross-brand pooling, and white-label tracking that raises fleet utilization.",
    targetCustomers: ["Restaurant chains", "Pharmacies", "E-commerce retailers"],
    traction: "18,000 daily deliveries with 22% average cost reduction for partner brands.",
    fundingNeed: "Seed extension to expand to two neighboring markets and launch dark-store fulfillment.",
    tags: ["Logistics", "Last-mile delivery", "Fleet optimization", "Marketplace"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-030",
    firstName: "Fatima",
    familyName: "Alajmi",
    fullName: "Fatima Alajmi",
    gender: "female",
    country: "Kuwait",
    city: "Kuwait City",
    region: "GCC",
    sector: "EdTech",
    startupName: "Alwan Learning",
    startupStage: "MVP",
    businessModel: "School licensing and therapy-center subscriptions",
    description:
      "Alwan Learning creates structured learning programs for children with dyslexia and ADHD, combining Arabic-language exercises with progress tools for specialists.",
    shortBio:
      "Special-education teacher who built her first exercises in slide decks for her own classroom before turning them into a product.",
    problemSolved:
      "Arabic-speaking children with learning differences have almost no structured digital tools, and specialists track progress on paper.",
    solution:
      "Clinically-informed Arabic exercise libraries with gamified practice, specialist dashboards, and parent progress reports.",
    targetCustomers: ["Special-education centers", "Inclusive schools", "Parents of neurodiverse children"],
    traction: "14 partner centers and 2,300 children in active programs.",
    fundingNeed: "Raising to validate outcomes in a clinical study and expand to speech-therapy modules.",
    tags: ["EdTech", "Special education", "Arabic learning", "Inclusion"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-031",
    firstName: "Dalal",
    familyName: "Alenezi",
    fullName: "Dalal Alenezi",
    gender: "female",
    country: "Kuwait",
    city: "Kuwait City",
    region: "GCC",
    sector: "RetailTech",
    startupName: "Thouq Retail",
    startupStage: "Pre-Seed",
    businessModel: "SaaS plus payment processing fees",
    description:
      "Thouq Retail turns Instagram and WhatsApp sellers into real businesses with instant storefronts, order management, and integrated delivery booking.",
    shortBio:
      "Started as a home-based seller herself and grew an accessories brand before building tools for the sellers who came after her.",
    problemSolved:
      "Tens of thousands of social-media sellers manage orders in chat threads, losing track of payments, inventory, and delivery status.",
    solution:
      "A one-tap storefront that syncs with social channels, automates payment links and delivery pickup, and builds seller credit history.",
    targetCustomers: ["Social-commerce sellers", "Home-based businesses", "Micro brands"],
    traction: "1,900 active seller storefronts processing 11,000 monthly orders.",
    fundingNeed: "Pre-seed to add inventory financing and expand across the northern Gulf.",
    tags: ["RetailTech", "Social commerce", "SME tools", "Payments"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-032",
    firstName: "Jassim",
    familyName: "Alkuwari",
    fullName: "Jassim Alkuwari",
    gender: "male",
    country: "Qatar",
    city: "Doha",
    region: "GCC",
    sector: "Cybersecurity",
    startupName: "Deraa Cyber",
    startupStage: "Seed",
    businessModel: "Managed detection and response retainers",
    description:
      "Deraa Cyber runs a regional managed detection and response service purpose-built for mid-size banks and insurers that cannot staff a 24/7 security operations center.",
    shortBio:
      "Former central-bank security examiner who audited dozens of institutions and knew exactly which gaps attackers exploit.",
    problemSolved:
      "Mid-size financial institutions face bank-grade threats with skeleton security teams and tooling they cannot fully operate.",
    solution:
      "A 24/7 SOC-as-a-service with financial-sector playbooks, regulatory reporting templates, and bilingual incident response.",
    targetCustomers: ["Mid-size banks", "Insurance companies", "Investment firms"],
    traction: "11 financial institutions under management across three GCC markets.",
    fundingNeed: "Seed capital to build a second SOC site and achieve additional sector certifications.",
    tags: ["Cybersecurity", "MDR", "Financial services", "SOC"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-033",
    firstName: "Noora",
    familyName: "Althani",
    fullName: "Noora Althani",
    gender: "female",
    country: "Qatar",
    city: "Doha",
    region: "GCC",
    sector: "MediaTech",
    startupName: "Sada Sports",
    startupStage: "Seed",
    businessModel: "B2B licensing to clubs and broadcasters",
    description:
      "Sada Sports uses AI to generate instant multilingual highlight clips and social content from live sports feeds, cutting production time from hours to seconds.",
    shortBio:
      "Sports broadcaster turned founder who ran live production control rooms and automated the workflow she once managed manually.",
    problemSolved:
      "Clubs and leagues sit on valuable live footage but lack production capacity to publish timely highlights across languages and platforms.",
    solution:
      "Real-time event detection on live feeds that auto-cuts, brands, captions, and localizes clips for every social platform.",
    targetCustomers: ["Sports clubs", "Leagues", "Broadcasters"],
    traction: "Live with 8 clubs and one league, generating 40,000 clips per season.",
    fundingNeed: "Seed round to expand into motorsport and padel verticals ahead of major regional tournaments.",
    tags: ["MediaTech", "Sports", "AI video", "Content automation"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-034",
    firstName: "Tamim",
    familyName: "Alsulaiti",
    fullName: "Tamim Alsulaiti",
    gender: "male",
    country: "Qatar",
    city: "Doha",
    region: "GCC",
    sector: "Smart Cities",
    startupName: "Barid Grid",
    startupStage: "MVP",
    businessModel: "Savings-share energy contracts",
    description:
      "Barid Grid optimizes district cooling plants with machine learning, trimming energy consumption while keeping towers and malls at target temperatures.",
    shortBio:
      "Mechanical engineer who commissioned cooling plants across the Gulf and realized their control logic hadn't changed in twenty years.",
    problemSolved:
      "District cooling consumes enormous electricity, and plants run on static setpoints that ignore weather forecasts and occupancy patterns.",
    solution:
      "An optimization layer that forecasts thermal load and continuously retunes chiller sequencing, achieving double-digit energy savings.",
    targetCustomers: ["District cooling operators", "Mega-mall owners", "Utility companies"],
    traction: "Two plants live with a verified 14% average energy reduction.",
    fundingNeed: "Raising to certify integrations with the two dominant plant-control vendors and scale deployments.",
    tags: ["Smart Cities", "Energy efficiency", "District cooling", "Machine learning"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-035",
    firstName: "Khalifa",
    familyName: "Alzayani",
    fullName: "Khalifa Alzayani",
    gender: "male",
    country: "Bahrain",
    city: "Manama",
    region: "GCC",
    sector: "Blockchain Infrastructure",
    startupName: "Jisr Ledger",
    startupStage: "Seed",
    businessModel: "Per-transaction settlement fees",
    description:
      "Jisr Ledger operates tokenized settlement rails that let regional banks clear interbank obligations in minutes instead of end-of-day batch cycles.",
    shortBio:
      "Core-banking engineer who maintained overnight settlement batches and set out to make them obsolete.",
    problemSolved:
      "Interbank settlement in the region still runs on batch windows, trapping liquidity and delaying corporate payments.",
    solution:
      "A regulated distributed ledger with tokenized central-bank-money settlement, atomic swaps, and full audit visibility for regulators.",
    targetCustomers: ["Commercial banks", "Central banks", "Payment service providers"],
    traction: "Regulatory sandbox graduate with three banks in live limited settlement.",
    fundingNeed: "Seed round to scale node infrastructure and onboard a second country corridor.",
    tags: ["Blockchain Infrastructure", "Interbank settlement", "Tokenization", "RegTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-036",
    firstName: "Latifa",
    familyName: "Almoayyed",
    fullName: "Latifa Almoayyed",
    gender: "female",
    country: "Bahrain",
    city: "Manama",
    region: "GCC",
    sector: "FinTech",
    startupName: "Mithaq Comply",
    startupStage: "MVP",
    businessModel: "Compliance SaaS with per-check pricing",
    description:
      "Mithaq Comply is a KYC and AML platform that automates onboarding checks, sanctions screening, and ongoing monitoring for fintechs and exchange houses.",
    shortBio:
      "Former head of compliance at a payments firm who decided the tooling problem was bigger than any single compliance team.",
    problemSolved:
      "Regional fintechs stitch together foreign compliance tools that misread Arabic names and lack local watchlist coverage.",
    solution:
      "Arabic-native name matching, regional watchlist integrations, and configurable risk scoring in one auditable compliance workspace.",
    targetCustomers: ["Fintech startups", "Exchange houses", "Crypto platforms"],
    traction: "19 fintech clients running 60,000 checks monthly.",
    fundingNeed: "Raising to add perpetual-KYC monitoring and expand coverage to North African markets.",
    tags: ["FinTech", "KYC", "AML", "RegTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-037",
    firstName: "Ebrahim",
    familyName: "Aldoseri",
    fullName: "Ebrahim Aldoseri",
    gender: "male",
    country: "Bahrain",
    city: "Muharraq",
    region: "GCC",
    sector: "TourismTech",
    startupName: "Danah Trails",
    startupStage: "Idea",
    businessModel: "Experience marketplace commission",
    description:
      "Danah Trails is designing a cultural tourism marketplace around pearl-diving heritage, coastal crafts, and old-town food trails led by local storytellers.",
    shortBio:
      "Museum educator and heritage guide who believes the islands' stories deserve better than souvenir shops.",
    problemSolved:
      "Cultural tourism experiences exist informally through personal networks, invisible to the visitors actively looking for them.",
    solution:
      "A curated marketplace that certifies heritage hosts, packages half-day cultural trails, and handles booking and multilingual guiding.",
    targetCustomers: ["Cultural travelers", "Cruise stopover visitors", "School trip organizers"],
    traction: "Waitlist of 45 heritage hosts and a completed pilot weekend with 200 visitors.",
    fundingNeed: "Idea-stage funding to build the booking platform and certify the first 100 hosts.",
    tags: ["TourismTech", "Cultural heritage", "Marketplace", "Experiences"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-038",
    firstName: "Said",
    familyName: "Albalushi",
    fullName: "Said Albalushi",
    gender: "male",
    country: "Oman",
    city: "Muscat",
    region: "GCC",
    sector: "AgriTech",
    startupName: "Mawj Aqua",
    startupStage: "Seed",
    businessModel: "Monitoring hardware plus insights subscription",
    description:
      "Mawj Aqua equips fish farms with underwater sensors and AI models that predict oxygen crashes and disease outbreaks before stock losses occur.",
    shortBio:
      "Marine biologist from a coastal fishing family bringing precision aquaculture to the region's fastest-growing protein industry.",
    problemSolved:
      "Fish farms lose entire cages to sudden oxygen drops and late-detected disease, threatening a strategic food-security industry.",
    solution:
      "Continuous water-quality sensing with predictive alerts, feeding optimization, and harvest-planning analytics for cage and pond farms.",
    targetCustomers: ["Aquaculture operators", "Fisheries investors", "Food-security programs"],
    traction: "12 farms monitored with documented 18% reduction in stock mortality.",
    fundingNeed: "Seed capital to launch shrimp-farm modules and expand along the Indian Ocean coastline.",
    tags: ["AgriTech", "Aquaculture", "IoT", "Food security"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-039",
    firstName: "Aisha",
    familyName: "Alharthi",
    fullName: "Aisha Alharthi",
    gender: "female",
    country: "Oman",
    city: "Muscat",
    region: "GCC",
    sector: "ClimateTech",
    startupName: "Qurm Carbon",
    startupStage: "Prototype",
    businessModel: "Carbon-credit measurement and verification fees",
    description:
      "Qurm Carbon measures and verifies blue-carbon sequestration in mangrove restoration projects using drones, tide sensors, and satellite time series.",
    shortBio:
      "Coastal ecologist who mapped mangrove loss for research and now builds the measurement layer that funds restoration.",
    problemSolved:
      "Mangrove restoration projects struggle to access carbon markets because credible, affordable measurement and verification is missing.",
    solution:
      "An automated MRV stack combining remote sensing with field sensors to certify blue-carbon credits at a fraction of consultant costs.",
    targetCustomers: ["Restoration project developers", "Carbon credit buyers", "Environmental authorities"],
    traction: "Two pilot restoration sites instrumented covering 800 hectares.",
    fundingNeed: "Prototype funding to complete methodology certification with a major carbon registry.",
    tags: ["ClimateTech", "Blue carbon", "MRV", "Remote sensing"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-040",
    firstName: "Zahra",
    familyName: "Alriyami",
    fullName: "Zahra Alriyami",
    gender: "female",
    country: "Oman",
    city: "Salalah",
    region: "GCC",
    sector: "HealthTech",
    startupName: "Awafi Health",
    startupStage: "Pre-Seed",
    businessModel: "Consultation fees plus pharmacy delivery margin",
    description:
      "Awafi Health connects patients in smaller towns with specialist doctors by video and delivers prescribed medication to their door within hours.",
    shortBio:
      "Pharmacist who watched patients drive four hours for fifteen-minute specialist visits and decided distance shouldn't decide health outcomes.",
    problemSolved:
      "Patients outside major cities face long journeys for specialist consultations and unreliable access to prescribed medication.",
    solution:
      "Regional telehealth with integrated e-prescriptions and a pharmacy-network delivery layer covering secondary cities and rural areas.",
    targetCustomers: ["Rural patients", "Elderly patients", "Regional clinics"],
    traction: "3,800 consultations completed with a pharmacy network covering 3 governorates.",
    fundingNeed: "Pre-seed round to add chronic-medication subscriptions and expand doctor coverage.",
    tags: ["HealthTech", "Telemedicine", "Rural access", "Pharmacy"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },

  // ────────────────────────────── Arab non-GCC (10) ──────────────────────────────
  {
    id: "ent-041",
    firstName: "Karim",
    familyName: "Elmasry",
    fullName: "Karim Elmasry",
    gender: "male",
    country: "Egypt",
    city: "Cairo",
    region: "Arab World",
    sector: "FinTech",
    startupName: "Mizan Lending",
    startupStage: "Series A",
    businessModel: "Interest margin and scoring API fees",
    description:
      "Mizan Lending scores small merchants using cash-flow data from POS terminals and mobile wallets, unlocking working-capital loans banks cannot underwrite.",
    shortBio:
      "Credit-risk quant who left banking after concluding the data to score small merchants existed — just not inside banks.",
    problemSolved:
      "Millions of small merchants are creditworthy but invisible to banks because they lack financial statements and collateral.",
    solution:
      "Alternative credit scoring on transaction streams with instant loan offers repaid automatically as a share of daily sales.",
    targetCustomers: ["Small merchants", "Kiosk owners", "Light manufacturers"],
    traction: "EGP 900M disbursed across 28,000 merchants with sub-3% default rates.",
    fundingNeed: "Series A to expand the loan book and license the scoring engine to two partner banks.",
    tags: ["FinTech", "SME lending", "Credit scoring", "Financial inclusion"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-042",
    firstName: "Salma",
    familyName: "Abdelrahman",
    fullName: "Salma Abdelrahman",
    gender: "female",
    country: "Egypt",
    city: "Cairo",
    region: "Arab World",
    sector: "HealthTech",
    startupName: "Ommi Care",
    startupStage: "Seed",
    businessModel: "Freemium app with clinic partnerships",
    description:
      "Ommi Care guides expectant and new mothers through pregnancy and the first year with week-by-week Arabic content, risk screening, and midwife chat support.",
    shortBio:
      "Public-health researcher specializing in maternal outcomes who turned field research into a mass-market product.",
    problemSolved:
      "Maternal-health information reaching mothers is fragmented and often inaccurate, and warning signs go unrecognized until emergencies.",
    solution:
      "Clinically reviewed Arabic guidance with symptom checkers that escalate high-risk cases to partner clinics and teleconsultations.",
    targetCustomers: ["Expectant mothers", "New parents", "Maternity clinics"],
    traction: "480,000 registered mothers and 90 partner clinics across two countries.",
    fundingNeed: "Seed round to add postpartum mental-health programs and expand into North African markets.",
    tags: ["HealthTech", "Maternal health", "Arabic content", "Consumer health"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-043",
    firstName: "Youssef",
    familyName: "Elshazly",
    fullName: "Youssef Elshazly",
    gender: "male",
    country: "Egypt",
    city: "Alexandria",
    region: "Arab World",
    sector: "Logistics",
    startupName: "Mina Move",
    startupStage: "MVP",
    businessModel: "Per-container booking fees",
    description:
      "Mina Move digitizes container drayage around seaports, matching import containers with returning empty trucks to eliminate wasted one-way trips.",
    shortBio:
      "Port operations supervisor who watched empty trucks queue for hours and built the matching engine ports were missing.",
    problemSolved:
      "Nearly half of port truck trips run empty because container pickups and returns are booked through disconnected brokers.",
    solution:
      "A drayage marketplace with street-turn matching, digital gate documents, and live container tracking for forwarders.",
    targetCustomers: ["Freight forwarders", "Shipping lines", "Container truckers"],
    traction: "9,500 matched container moves with 31% average empty-mile reduction.",
    fundingNeed: "Raising to integrate with port community systems and expand to a second major port.",
    tags: ["Logistics", "Ports", "Drayage", "Optimization"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-044",
    firstName: "Mona",
    familyName: "Farouk",
    fullName: "Mona Farouk",
    gender: "female",
    country: "Egypt",
    city: "Giza",
    region: "Arab World",
    sector: "EdTech",
    startupName: "Herfa Academy",
    startupStage: "Pre-Seed",
    businessModel: "Income-share agreements and employer fees",
    description:
      "Herfa Academy trains young people in high-demand trades like solar installation, HVAC, and industrial maintenance through blended bootcamps with guaranteed job interviews.",
    shortBio:
      "Vocational-training director who saw employers begging for technicians while graduates begged for jobs, and built the bridge.",
    problemSolved:
      "Industrial employers face severe technician shortages while youth unemployment stays high because vocational training is outdated and stigmatized.",
    solution:
      "Employer-designed curricula, hands-on lab weekends, and hiring-partner pipelines with pay-after-employment financing.",
    targetCustomers: ["Young job seekers", "Industrial employers", "Development programs"],
    traction: "600 graduates with 78% job placement within three months.",
    fundingNeed: "Pre-seed to open two new training hubs and digitize the assessment platform.",
    tags: ["EdTech", "Vocational training", "Employment", "Skills"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-045",
    firstName: "Amine",
    familyName: "Benali",
    fullName: "Amine Benali",
    gender: "male",
    country: "Morocco",
    city: "Casablanca",
    region: "Arab World",
    sector: "AI",
    startupName: "Atlas Dialog",
    startupStage: "Seed",
    businessModel: "Per-conversation API pricing",
    description:
      "Atlas Dialog builds conversational AI that genuinely understands Moroccan Darija and French code-switching, powering customer support for telecoms and banks.",
    shortBio:
      "NLP researcher who published on low-resource dialects and founded the company when no vendor could handle his home market's language reality.",
    problemSolved:
      "Standard Arabic chatbots fail on Darija and mixed French-Arabic messages, forcing companies to keep expensive human-only support.",
    solution:
      "Dialect-native language models trained on code-switched conversations, deployed as drop-in support automation with human handoff.",
    targetCustomers: ["Telecom operators", "Banks", "E-commerce platforms"],
    traction: "Handling 2M conversations monthly for 9 enterprise clients across the Maghreb.",
    fundingNeed: "Seed round to expand to Tunisian and Algerian dialects and launch voice support.",
    tags: ["AI", "Conversational AI", "Darija NLP", "Customer support"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-046",
    firstName: "Ghita",
    familyName: "Berrada",
    fullName: "Ghita Berrada",
    gender: "female",
    country: "Morocco",
    city: "Rabat",
    region: "Arab World",
    sector: "GovTech",
    startupName: "Bawaba Services",
    startupStage: "MVP",
    businessModel: "Government contracts and citizen service fees",
    description:
      "Bawaba Services digitizes administrative document requests, letting citizens obtain certificates and civil records online with courier delivery instead of queueing at offices.",
    shortBio:
      "Former management consultant on public-sector modernization projects who left to ship the citizen experience she kept recommending in slide decks.",
    problemSolved:
      "Citizens lose entire workdays queueing for routine administrative documents, and offices drown in repetitive counter requests.",
    solution:
      "An online request portal integrated with civil registries, digital identity verification, and tracked courier fulfillment.",
    targetCustomers: ["Citizens", "Local administrations", "Notaries and lawyers"],
    traction: "160,000 documents delivered across 40 partnered administrative offices.",
    fundingNeed: "Raising to integrate national digital ID and expand coverage to all major regions.",
    tags: ["GovTech", "Digital services", "Civil records", "Citizen experience"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-047",
    firstName: "Reda",
    familyName: "Chraibi",
    fullName: "Reda Chraibi",
    gender: "male",
    country: "Morocco",
    city: "Marrakesh",
    region: "Arab World",
    sector: "TourismTech",
    startupName: "Zellij Stays",
    startupStage: "Seed",
    businessModel: "Revenue-management SaaS with booking commissions",
    description:
      "Zellij Stays gives independent riads and guesthouses hotel-grade revenue management, dynamic pricing, and direct-booking websites that cut OTA dependency.",
    shortBio:
      "Third-generation riad operator who taught himself revenue management and now packages it for a thousand fellow independent hoteliers.",
    problemSolved:
      "Independent guesthouses underprice peak dates, overpay OTA commissions, and lack the tools chain hotels take for granted.",
    solution:
      "Automated dynamic pricing tuned to local demand signals, channel management, and conversion-optimized direct booking engines.",
    targetCustomers: ["Riad owners", "Boutique guesthouses", "Small hotel groups"],
    traction: "340 properties live with average 19% revenue uplift in the first six months.",
    fundingNeed: "Seed capital to expand along Atlantic coast destinations and add experience upselling.",
    tags: ["TourismTech", "Revenue management", "Hospitality", "SaaS"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-048",
    firstName: "Zaid",
    familyName: "Haddad",
    fullName: "Zaid Haddad",
    gender: "male",
    country: "Jordan",
    city: "Amman",
    region: "Arab World",
    sector: "Cybersecurity",
    startupName: "Aman Shield",
    startupStage: "MVP",
    businessModel: "Developer-seat SaaS subscription",
    description:
      "Aman Shield embeds application security directly into developer workflows, scanning code, dependencies, and APIs with fixes suggested as ready-to-merge patches.",
    shortBio:
      "Security engineer and bug-bounty hunter who found the same vulnerability classes in every startup he tested.",
    problemSolved:
      "Startups ship fast without security review because traditional appsec tools are noisy, slow, and built for enterprise security teams.",
    solution:
      "Developer-first scanning that prioritizes exploitable findings and auto-generates patches, wired into pull requests and CI pipelines.",
    targetCustomers: ["Startup engineering teams", "Software agencies", "Fintech developers"],
    traction: "170 engineering teams onboarded with 11,000 vulnerabilities auto-patched.",
    fundingNeed: "Raising to build runtime API protection and grow developer-community adoption.",
    tags: ["Cybersecurity", "AppSec", "Developer tools", "DevSecOps"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-049",
    firstName: "Dina",
    familyName: "Khoury",
    fullName: "Dina Khoury",
    gender: "female",
    country: "Jordan",
    city: "Amman",
    region: "Arab World",
    sector: "Creator Economy",
    startupName: "Ibdaa Hub",
    startupStage: "Prototype",
    businessModel: "Course-sales revenue share",
    description:
      "Ibdaa Hub lets Arabic-speaking experts turn their knowledge into polished online courses with AI-assisted production, hosting, and learner payments handled end to end.",
    shortBio:
      "Instructional designer who produced courses for universities and saw independent Arab experts locked out by production costs.",
    problemSolved:
      "Talented Arabic-speaking experts stay off course platforms because production is expensive and existing platforms are English-first.",
    solution:
      "AI-assisted course creation that turns raw recordings into structured lessons with quizzes, subtitles, and a built-in learner marketplace.",
    targetCustomers: ["Independent experts", "Professional trainers", "Lifelong learners"],
    traction: "85 creators in closed beta publishing 210 courses with early learner revenue.",
    fundingNeed: "Prototype-stage funding to launch publicly and build mobile learning apps.",
    tags: ["Creator Economy", "Online courses", "Arabic content", "EdTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-050",
    firstName: "Lina",
    familyName: "Awad",
    fullName: "Lina Awad",
    gender: "female",
    country: "Jordan",
    city: "Aqaba",
    region: "Arab World",
    sector: "AgriTech",
    startupName: "Ghaith Agri",
    startupStage: "Idea",
    businessModel: "Greenhouse-as-a-service leasing",
    description:
      "Ghaith Agri is designing water-smart greenhouse kits with fog harvesting and closed-loop hydroponics for farmers in water-scarce valleys.",
    shortBio:
      "Agricultural economist raised between Amman and the Jordan Valley, focused on making farming viable with a fraction of the water.",
    problemSolved:
      "Farmers in one of the world's most water-scarce regions cannot afford modern greenhouse systems that would multiply yield per drop.",
    solution:
      "Modular greenhouse kits leased with harvest-linked payments, combining hydroponics, humidity capture, and agronomist support.",
    targetCustomers: ["Smallholder farmers", "Agricultural cooperatives", "Development funds"],
    traction: "Feasibility study completed with a pilot design validated by two agronomy institutes.",
    fundingNeed: "Idea-stage grant and angel funding to build the first three demonstration greenhouses.",
    tags: ["AgriTech", "Water scarcity", "Hydroponics", "Sustainability"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },

  // ────────────────────────────── Global (12) ──────────────────────────────
  {
    id: "ent-051",
    firstName: "James",
    familyName: "Carter",
    fullName: "James Carter",
    gender: "male",
    country: "United States",
    city: "Austin",
    region: "Americas",
    sector: "AI",
    startupName: "Opsmith AI",
    startupStage: "Growth",
    businessModel: "Tiered B2B SaaS subscription",
    description:
      "Opsmith AI is an operations copilot for small manufacturers, forecasting material needs, scheduling machine maintenance, and drafting supplier negotiations automatically.",
    shortBio:
      "Former plant manager who taught himself machine learning on night shifts and built the assistant he always needed on the floor.",
    problemSolved:
      "Small manufacturers run on spreadsheets and tribal knowledge, losing margin to stockouts, unplanned downtime, and weak supplier terms.",
    solution:
      "An AI layer over existing ERP data that predicts operational problems and executes routine planning work with human approval.",
    targetCustomers: ["Small manufacturers", "Machine shops", "Contract producers"],
    traction: "620 factories subscribed with USD 9M annual recurring revenue.",
    fundingNeed: "Growth capital for European expansion and an integration marketplace.",
    tags: ["AI", "Manufacturing", "Operations", "B2B SaaS"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-052",
    firstName: "Emily",
    familyName: "Johnson",
    fullName: "Emily Johnson",
    gender: "female",
    country: "United Kingdom",
    city: "London",
    region: "Europe",
    sector: "PropTech",
    startupName: "Keyward",
    startupStage: "Series A",
    businessModel: "Fees from landlords and deposit-alternative premiums",
    description:
      "Keyward replaces cash rental deposits with insurance-backed guarantees and gives landlords instant, fair tenant referencing built on open-banking data.",
    shortBio:
      "Ex-fintech product lead who rented in five cities and decided the deposit system deserved to be rebuilt from scratch.",
    problemSolved:
      "Tenants lock up thousands in deposits while landlords still face arrears risk, and referencing relies on slow, biased paperwork.",
    solution:
      "Open-banking affordability checks with a deposit-free guarantee product that protects landlords better than cash deposits.",
    targetCustomers: ["Letting agencies", "Build-to-rent operators", "Tenants"],
    traction: "42,000 tenancies covered and partnerships with 300 letting agencies.",
    fundingNeed: "Series A to expand into continental European rental markets.",
    tags: ["PropTech", "Renting", "Open banking", "InsurTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-053",
    firstName: "Lukas",
    familyName: "Schneider",
    fullName: "Lukas Schneider",
    gender: "male",
    country: "Germany",
    city: "Munich",
    region: "Europe",
    sector: "Robotics",
    startupName: "Inspecta Robotics",
    startupStage: "Series A",
    businessModel: "Robotics-as-a-service with per-scan pricing",
    description:
      "Inspecta Robotics deploys autonomous drones inside warehouses that scan inventory overnight, reconciling stock counts without disrupting daytime operations.",
    shortBio:
      "Robotics PhD who spent years on drone autonomy research and found the killer application inside warehouse racking.",
    problemSolved:
      "Warehouse cycle counting is slow, error-prone manual work, so inventory records drift and companies buy safety stock they don't need.",
    solution:
      "Self-charging indoor drones with barcode and RFID scanning that deliver nightly inventory accuracy above 99.5%.",
    targetCustomers: ["3PL operators", "Retail distribution centers", "Automotive parts warehouses"],
    traction: "70 warehouses under contract across four European countries.",
    fundingNeed: "Series A extension to enter the North American market and launch pallet-dimension scanning.",
    tags: ["Robotics", "Warehouse automation", "Drones", "Inventory"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-054",
    firstName: "Claire",
    familyName: "Moreau",
    fullName: "Claire Moreau",
    gender: "female",
    country: "France",
    city: "Paris",
    region: "Europe",
    sector: "RetailTech",
    startupName: "Reluxe Verify",
    startupStage: "Seed",
    businessModel: "Per-authentication fees for resale platforms",
    description:
      "Reluxe Verify authenticates pre-owned luxury goods using microscopic material imaging and AI, giving resale platforms instant counterfeit detection at scale.",
    shortBio:
      "Former luxury-house quality director who examined thousands of counterfeits and encoded that expertise into computer vision.",
    problemSolved:
      "Booming luxury resale is throttled by counterfeits, and expert human authentication cannot scale with marketplace volumes.",
    solution:
      "Portable imaging devices and AI models trained on material microstructures that authenticate items in minutes with audit certificates.",
    targetCustomers: ["Resale marketplaces", "Consignment stores", "Luxury brands"],
    traction: "500,000 items authenticated with 4 major resale platforms integrated.",
    fundingNeed: "Seed round to cover watches and jewelry categories and open an Asian lab.",
    tags: ["RetailTech", "Luxury resale", "Authentication", "Computer vision"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-055",
    firstName: "Haruto",
    familyName: "Tanaka",
    fullName: "Haruto Tanaka",
    gender: "male",
    country: "Japan",
    city: "Tokyo",
    region: "Asia-Pacific",
    sector: "Robotics",
    startupName: "Kaigo Robotics",
    startupStage: "Growth",
    businessModel: "Care-facility leasing with service contracts",
    description:
      "Kaigo Robotics builds assistive robots that help eldercare staff with patient transfers, night monitoring, and mobility support in care facilities.",
    shortBio:
      "Robotics engineer who cared for his grandmother and redirected his career toward the caregiving workforce crisis.",
    problemSolved:
      "Aging societies face severe caregiver shortages, and physical strain drives high turnover among the caregivers who remain.",
    solution:
      "Transfer-assist and monitoring robots designed with caregivers, reducing physical load and enabling safe single-person care routines.",
    targetCustomers: ["Eldercare facilities", "Rehabilitation hospitals", "Home-care providers"],
    traction: "Robots deployed in 210 care facilities with government-backed adoption subsidies.",
    fundingNeed: "Growth funding to scale manufacturing and enter European eldercare markets.",
    tags: ["Robotics", "Eldercare", "Assistive technology", "HealthTech"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-056",
    firstName: "Minji",
    familyName: "Park",
    fullName: "Minji Park",
    gender: "female",
    country: "South Korea",
    city: "Seoul",
    region: "Asia-Pacific",
    sector: "Creator Economy",
    startupName: "Studio Nabi",
    startupStage: "Seed",
    businessModel: "Creator SaaS subscription with asset marketplace",
    description:
      "Studio Nabi gives solo video creators a virtual production studio, with AI set design, automated multi-camera editing, and real-time motion graphics.",
    shortBio:
      "Broadcast motion designer who left television to put studio-grade production tools in every creator's laptop.",
    problemSolved:
      "Solo creators compete against studio-produced content but professional virtual production tools require teams and expensive hardware.",
    solution:
      "Browser-based virtual sets with AI-driven camera switching and template motion graphics rendered in real time on consumer GPUs.",
    targetCustomers: ["Video creators", "Online educators", "Indie media studios"],
    traction: "38,000 subscribed creators and a template marketplace with 1,200 sellers.",
    fundingNeed: "Seed extension to launch live-streaming production mode and localized versions.",
    tags: ["Creator Economy", "Virtual production", "Video tools", "AI"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-057",
    firstName: "Wei",
    familyName: "Zhang",
    fullName: "Wei Zhang",
    gender: "male",
    country: "China",
    city: "Shenzhen",
    region: "Asia-Pacific",
    sector: "Smart Cities",
    startupName: "Lumo Grid",
    startupStage: "Series A",
    businessModel: "Hardware sales with network SaaS",
    description:
      "Lumo Grid retrofits streetlight networks into city sensing platforms, adding air-quality, traffic, and flood sensors that piggyback on existing power and poles.",
    shortBio:
      "Hardware engineer from the electronics manufacturing world who saw streetlights as the cheapest city-wide sensor backbone available.",
    problemSolved:
      "Cities want dense environmental and traffic sensing but standalone sensor deployments cost too much to install and power at scale.",
    solution:
      "Plug-in sensor modules for standard streetlight fittings with mesh networking and a city dashboard, cutting deployment cost by 80%.",
    targetCustomers: ["City governments", "Utility companies", "Road authorities"],
    traction: "60,000 retrofitted poles across 9 city deployments.",
    fundingNeed: "Series A to expand internationally and add edge AI traffic analytics.",
    tags: ["Smart Cities", "IoT", "Urban sensing", "Hardware"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-058",
    firstName: "Arjun",
    familyName: "Mehta",
    fullName: "Arjun Mehta",
    gender: "male",
    country: "India",
    city: "Bengaluru",
    region: "South Asia",
    sector: "Digital Identity",
    startupName: "Pehchan Verify",
    startupStage: "Seed",
    businessModel: "Per-credential issuance and verification fees",
    description:
      "Pehchan Verify issues portable, verifiable work credentials for gig and blue-collar workers, letting them carry ratings and skill proofs between platforms.",
    shortBio:
      "Former gig-platform product manager who watched five-star drivers start from zero on every new app and decided reputation should be portable.",
    problemSolved:
      "Gig workers' ratings, background checks, and skill certifications are trapped inside individual platforms, repeated at every job switch.",
    solution:
      "A verifiable-credentials wallet where employers and platforms issue signed work records that workers share with one tap.",
    targetCustomers: ["Gig platforms", "Staffing agencies", "Blue-collar workers"],
    traction: "1.1M credentials issued through 14 platform integrations.",
    fundingNeed: "Seed round to add lending-partner integrations so credentials unlock worker credit.",
    tags: ["Digital Identity", "Gig economy", "Verifiable credentials", "Workforce"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-059",
    firstName: "Aina",
    familyName: "Rahman",
    fullName: "Aina Rahman",
    gender: "female",
    country: "Malaysia",
    city: "Kuala Lumpur",
    region: "Asia-Pacific",
    sector: "AgriTech",
    startupName: "Sawit Sense",
    startupStage: "Seed",
    businessModel: "Per-hectare monitoring subscription",
    description:
      "Sawit Sense helps smallholder palm growers boost yield sustainably with drone canopy analysis, precision fertilization plans, and certification tracking.",
    shortBio:
      "Agronomist and daughter of smallholders who built the advisory service her parents' cooperative could never afford.",
    problemSolved:
      "Smallholders produce far below plantation yields and struggle to meet sustainability certification demanded by global buyers.",
    solution:
      "Affordable drone-based canopy diagnostics with fertilization prescriptions and digital traceability records for certification audits.",
    targetCustomers: ["Smallholder farmers", "Grower cooperatives", "Commodity buyers"],
    traction: "31,000 hectares monitored across 60 cooperatives with 15% average yield gains.",
    fundingNeed: "Seed capital to expand to rubber and cocoa crops across Southeast Asia.",
    tags: ["AgriTech", "Precision agriculture", "Sustainability", "Smallholders"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-060",
    firstName: "Thabo",
    familyName: "Dlamini",
    fullName: "Thabo Dlamini",
    gender: "male",
    country: "South Africa",
    city: "Cape Town",
    region: "Africa",
    sector: "Geospatial Intelligence",
    startupName: "Mzansi Maps",
    startupStage: "MVP",
    businessModel: "Data licensing to utilities and insurers",
    description:
      "Mzansi Maps builds living maps of informal settlements and fast-growing urban areas, giving utilities and insurers address-level data where official maps stop.",
    shortBio:
      "Geographer who grew up in a township that didn't appear correctly on any map and made fixing that his life's work.",
    problemSolved:
      "Millions of homes in informal and fast-growing areas lack addresses and map coverage, blocking service delivery, credit, and insurance.",
    solution:
      "AI-assisted mapping from satellite and street imagery combined with community mappers, producing addressable structure-level datasets.",
    targetCustomers: ["Electric utilities", "Insurers", "Municipal planners"],
    traction: "2.3M structures mapped with two utility contracts signed.",
    fundingNeed: "Raising to expand coverage to three more metros and launch an addressing API.",
    tags: ["Geospatial Intelligence", "Mapping", "Urban data", "Financial inclusion"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "male" },
  },
  {
    id: "ent-061",
    firstName: "Camila",
    familyName: "Rivera",
    fullName: "Camila Rivera",
    gender: "female",
    country: "Mexico",
    city: "Mexico City",
    region: "Americas",
    sector: "Logistics",
    startupName: "Ruta Norte",
    startupStage: "Seed",
    businessModel: "Freight brokerage margin with SaaS tools",
    description:
      "Ruta Norte is a digital freight network for cross-border trucking, handling customs paperwork, carrier vetting, and live shipment visibility on north-south trade lanes.",
    shortBio:
      "Trade-compliance specialist who processed border crossings for a decade and digitized the workflow she knew by heart.",
    problemSolved:
      "Cross-border shipments stall at customs due to paperwork errors, and shippers lose visibility the moment cargo changes carriers at the border.",
    solution:
      "A managed digital network with pre-validated customs documents, vetted transfer carriers, and door-to-door tracking across the border handoff.",
    targetCustomers: ["Manufacturers", "Freight forwarders", "Retail importers"],
    traction: "13,000 cross-border loads with 40% faster average border-crossing times.",
    fundingNeed: "Seed round to automate customs-document generation and add southbound produce lanes.",
    tags: ["Logistics", "Cross-border trade", "Freight", "Customs"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
  {
    id: "ent-062",
    firstName: "Ayesha",
    familyName: "Khan",
    fullName: "Ayesha Khan",
    gender: "female",
    country: "Pakistan",
    city: "Karachi",
    region: "South Asia",
    sector: "EdTech",
    startupName: "IlmSpark",
    startupStage: "Pre-Seed",
    businessModel: "Low-cost subscriptions with sponsor scholarships",
    description:
      "IlmSpark delivers offline-first STEM courses for girls in low-connectivity areas, with mentor circles and science kits shipped to community learning hubs.",
    shortBio:
      "Electrical engineer who was the only girl in her university cohort and is building the pipeline so she won't be the last.",
    problemSolved:
      "Girls in low-connectivity regions are systematically cut off from quality STEM education, mentorship, and hands-on practice.",
    solution:
      "Compressed offline video courses synced at community hubs, paired with physical experiment kits and remote mentor circles.",
    targetCustomers: ["Secondary-school girls", "Community learning hubs", "Education NGOs"],
    traction: "6,000 enrolled students across 85 community hubs in three provinces.",
    fundingNeed: "Pre-seed to produce advanced course tracks and reach 500 hubs with sponsor partnerships.",
    tags: ["EdTech", "STEM", "Girls education", "Offline-first"],
    avatar: { type: "cartoon", style: "professional-founder", gender: "female" },
  },
]

/** Curated set of profiles highlighted in the directory's featured section. */
const FEATURED_ENTREPRENEUR_IDS = [
  "ent-001", // Salman Alharbi — Mudrik AI
  "ent-002", // Noura Alharbi — Aafiya Care
  "ent-026", // Hamdan Alnuaimi — FloosLink
  "ent-033", // Noora Althani — Sada Sports
  "ent-041", // Karim Elmasry — Mizan Lending
  "ent-059", // Aina Rahman — Sawit Sense
]

export function getEntrepreneurs(): Entrepreneur[] {
  return entrepreneurs
}

export function getFeaturedEntrepreneurs(): Entrepreneur[] {
  return entrepreneurs.filter((entrepreneur) =>
    FEATURED_ENTREPRENEUR_IDS.includes(entrepreneur.id)
  )
}

export function getEntrepreneurById(id: string): Entrepreneur | undefined {
  return entrepreneurs.find((entrepreneur) => entrepreneur.id === id)
}

export function getEntrepreneursByCountry(country: string): Entrepreneur[] {
  const normalized = country.trim().toLowerCase()
  return entrepreneurs.filter(
    (entrepreneur) => entrepreneur.country.toLowerCase() === normalized
  )
}

export function getEntrepreneursBySector(sector: string): Entrepreneur[] {
  const normalized = sector.trim().toLowerCase()
  return entrepreneurs.filter(
    (entrepreneur) => entrepreneur.sector.toLowerCase() === normalized
  )
}

export function filterEntrepreneurs(filters: EntrepreneurFilters): Entrepreneur[] {
  const query = filters.search?.trim().toLowerCase() ?? ""

  return entrepreneurs.filter((entrepreneur) => {
    if (query) {
      const haystack = [
        entrepreneur.fullName,
        entrepreneur.country,
        entrepreneur.city,
        entrepreneur.startupName,
        entrepreneur.sector,
        ...entrepreneur.tags,
      ]
        .join(" ")
        .toLowerCase()
      if (!haystack.includes(query)) return false
    }

    if (filters.country && entrepreneur.country !== filters.country) return false
    if (filters.region && entrepreneur.region !== filters.region) return false
    if (filters.sector && entrepreneur.sector !== filters.sector) return false
    if (filters.gender && entrepreneur.gender !== filters.gender) return false
    if (filters.startupStage && entrepreneur.startupStage !== filters.startupStage) {
      return false
    }

    return true
  })
}

/** Unique, sorted country list derived from the dataset (for filter UIs). */
export function getEntrepreneurCountries(): string[] {
  return [...new Set(entrepreneurs.map((entrepreneur) => entrepreneur.country))].sort()
}
