import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'garage-door-replacement-cost',
  title: 'How much does garage door replacement cost?',
  description: 'A practical breakdown of garage door replacement costs by door type, insulation level, opener features, and what to expect when comparing installer quotes.',
  heroImage: '',
  heroAlt: 'Modern insulated garage door with carriage-style hardware and natural light on a suburban home exterior.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Garage door replacement is one of the highest-ROI home improvement projects you can do, often recouping 90% or more of the cost at resale. But the cost spectrum is wide, depending entirely on door material, size, insulation, windows, and whether you include a new opener.',
    'A basic single-car steel door with installation typically runs $800 to $1,500, while a double-car insulated door with windows and a smart opener can easily land between $1,800 and $4,000. Custom carriage-house doors and premium wood or composite options push past $5,000.',
    'The key to comparing quotes is separating door cost, opener cost, installation labor, and any structural or framing modifications. Getting those broken out clearly makes it easy to see what each installer is really offering.'
  ],
  ranges: [
    { label: 'Single-car steel door', range: '$800 to $1,500', note: 'Basic 8x7 or 9x7 non-insulated steel door with standard track and hardware.' },
    { label: 'Double-car insulated door', range: '$1,500 to $3,000', note: '16x7 insulated steel door with windows, upgraded hardware, and basic opener.' },
    { label: 'Premium carriage or wood door', range: '$3,000 to $6,000+', note: 'Carriage-house design, wood or composite, custom glass, smart opener, and decorative hardware.' },
    { label: 'Opener replacement only', range: '$250 to $600', note: 'Belt-drive or smart opener with installation, existing door and tracks remain.' },
  ],
  budgetFactors: [
    { item: 'Door material and insulation', impact: 'High', note: 'Steel is the standard, but wood, composite, aluminum, and glass each bring different costs and maintenance profiles.' },
    { item: 'Opener type and features', impact: 'High', note: 'Belt-drive smart openers cost more than chain-drive basics, but run quieter and integrate with home automation.' },
    { item: 'Custom sizing and modifications', impact: 'Medium', note: 'Non-standard openings, structural header changes, or masonry work for new openings add real labor.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask for door, opener, installation, and old-door disposal itemized separately so you can compare each component.',
    'Confirm insulation R-value, steel gauge, and warranty terms for both door and labor.',
    'Clarify whether the quote includes new weatherstripping, tracks, springs, and safety sensors.',
    'Check if the opener is smart-compatible and whether installation includes Wi-Fi setup and app configuration.',
  ],
  sections: [
    {
      heading: 'Door material and insulation set the baseline',
      paragraphs: [
        'Steel doors dominate the market because they offer the best balance of durability, cost, and curb appeal for most homes. Single-layer steel is the cheapest option but offers minimal insulation and can dent. Multi-layer insulated steel doors improve energy efficiency, sound dampening, and rigidity, which is why they are the most common upgrade.',
        'Wood and composite doors deliver a premium look, especially on carriage-house or custom homes, but they require more maintenance and cost significantly more. Aluminum and glass doors suit modern architecture but provide less insulation unless spec\'d with thermal breaks.',
        'Insulation matters if the garage is attached and conditioned or if you spend time in it. R-values of 12 to 18 are common for double-layer doors, while three-layer doors with polyurethane foam can reach R-18 to R-24.'
      ]
    },
    {
      heading: 'Opener choices affect both cost and daily convenience',
      paragraphs: [
        'Chain-drive openers are the most affordable and reliable but tend to be noisy. Screw-drive openers offer a middle ground with fewer moving parts, and belt-drive openers are the quietest option, making them ideal for attached garages with living space above or beside them.',
        'Smart openers add Wi-Fi connectivity, smartphone control, and integration with systems like Amazon Key for in-garage package delivery. The convenience is real, but it adds $50 to $150 to the opener cost. Battery backup is another worthwhile upgrade for areas with power outages.',
        'Jackshaft or wall-mount openers free up ceiling space and are popular in garages with high ceilings or storage above the door. They cost more than standard trolley openers but are the right choice for specific layouts.'
      ]
    },
    {
      heading: 'Installation complexity varies more than you might expect',
      paragraphs: [
        'A straightforward replacement of an existing door on standard track costs the least because the opening, framing, and electrical are already done. The installer simply removes the old door and opener, installs the new ones, and tests everything in place.',
        'Complications arise when the new door is a different size, the old framing is damaged, the spring system needs upgrading, or the electrical outlet for the opener needs to be added or relocated. Masonry walls, limited overhead clearance, and high-lift track configurations all add labor time.',
        'Old door disposal is another variable. Some installers include it; others charge extra. Confirm whether the quote covers hauling away the old door and opener, especially if you are replacing both.'
      ]
    },
    {
      heading: 'Single-car versus double-car pricing dynamics',
      paragraphs: [
        'A double-car door is roughly double the width but does not cost double the price because much of the labor is the same — one opening, one installation, one truck roll. The material cost scales with width, but the labor premium is modest.',
        'That said, a double-car door is heavier, requires stronger springs and tracks, and may need a more powerful opener. The total premium over a single door is typically 40% to 60%, not 100%, which makes double-car replacements a solid value proposition.',
        'If you have two separate single doors in a double garage, replacing both at once saves on mobilization and disposal costs compared to doing them separately. Ask for a multi-door discount.'
      ]
    },
    {
      heading: 'How to compare garage door quotes honestly',
      paragraphs: [
        'Start by specifying the exact door model, steel gauge, insulation level, window configuration, opener model, and whether any framing or structural work is needed. Send the same specification to at least three installers and compare the full package.',
        'Pay attention to warranty terms. Door manufacturers typically offer limited lifetime or 10-year warranties on materials, but installer labor warranties vary widely from 30 days to several years. A too-cheap quote often skimps on warranty coverage or uses a thinner-gauge door.',
        'Get a custom estimate for your specific garage, upload a photo and we will build the brief. Naili helps you organize door size, material preference, opener needs, and any structural considerations so every installer you talk to bids on the same scope.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Can I install a garage door myself to save money?',
      answer: 'Garage door installation involves high-tension springs that can cause serious injury if handled improperly. Most homeowners are better off hiring a professional, even though it adds labor cost.'
    },
    {
      question: 'Should I replace the opener at the same time as the door?',
      answer: 'Not always, but if your opener is more than 10 years old, lacks safety sensors, or is noisy, replacing it at the same time makes sense since the labor is already covered.'
    },
    {
      question: 'What R-value do I need for an insulated door?',
      answer: 'R-12 or higher is good for attached garages. R-18 to R-24 is ideal if the garage is conditioned or used as a workshop. Unheated detached garages can get by with non-insulated doors.'
    },
    {
      question: 'Does a garage door replacement really add resale value?',
      answer: 'Yes — garage door replacement consistently ranks among the top home improvement projects for resale value, often recouping 90% or more of the cost according to Remodeling magazine.'
    }
  ],
  sources: [
    { label: 'Remodeling Cost vs. Value Report', url: 'https://www.remodeling.hw.net/cost-vs-value/' },
    { label: 'HomeAdvisor Garage Door Installation Cost Guide', url: 'https://www.homeadvisor.com/cost/garages/install-a-garage-door/' },
  ],
} as CostGuide;
