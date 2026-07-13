import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'siding-installation-cost',
  title: 'How much does siding installation cost?',
  description: 'What new siding actually costs by material type, what prep work and trim details change the estimate, and how to compare contractor bids for a durable exterior finish.',
  heroImage: '/imagery/cost-guide-siding.webp',
  heroAlt: 'Two-story home with new horizontal lap siding in a warm neutral color.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Siding is a major exterior investment that touches the home\'s appearance, insulation, weather protection, and long-term maintenance. The cost swings widely by material, but the thing homeowners often miss is that prep work, trim details, corner counts, and window flashing matter as much as the siding material itself.',
    'For rough planning, a full siding replacement on a typical home with vinyl or engineered wood often ranges from $8,000 to $20,000. Premium materials like cedar shingles, stone veneer, stucco, or fiber cement with extensive trim packages push higher, often $20,000 or more depending on home size and complexity.',
    'Siding is also a project where the cheapest material install cost can lead to higher maintenance and replacement costs over time. The real question is not just what the siding material costs, but what the total installed system costs over the life you expect to live in the house.'
  ],
  ranges: getPricingPlanningRanges('siding'),
  budgetFactors: [
    { item: 'Material type and grade', impact: 'High', note: 'Vinyl and engineered wood are generally more affordable; fiber cement, cedar, stone, and stucco carry higher material and labor costs.' },
    { item: 'Prep and sheathing condition', impact: 'High', note: 'If old siding removal reveals rotten sheathing, inadequate housewrap, or missing flashing, repairs add significant cost before new siding goes up.' },
    { item: 'Home complexity', impact: 'Medium', note: 'Multiple stories, dormers, gables, many corners, and intricate trim details increase labor time and waste factor.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the exact material, thickness, and product line — not just "vinyl" or "fiber cement" but the specific brand and series being quoted.',
    'Ask whether the quote includes housewrap replacement, flashing at windows and doors, trim, soffit, fascia, and gutter removal/reinstall.',
    'Check the warranty terms for both the material and the installation labor, and whether warranty is prorated or full.',
    'Clarify how the contractor handles sheathing repair if rot or damage is discovered during removal.',
  ],
  sections: [
    {
      heading: 'Material choice defines the baseline, but installation tightens the range',
      paragraphs: [
        'Vinyl siding is often the most affordable entry point and has improved significantly in appearance and durability over the past decade. Engineered wood offers a natural look at a mid-range cost. Fiber cement is more expensive but offers excellent fire resistance, termite resistance, and longevity. Cedar, stone veneer, and stucco sit at the premium end.',
        'The material cost per square foot is only the starting point. Installation labor varies by material because some siding types are faster to install, require fewer specialized tools, or are lighter to handle. Fiber cement, for example, generates silica dust and requires special cutting and fastening, which increases labor time and cost.',
        'Trim and accessory pieces also add up. Outside corners, inside corners, J-channel, starter strips, window and door trim, soffit, and fascia each carry their own material and installation cost. A bare quote for "siding only" can be misleading if the trim package is not included.'
      ]
    },
    {
      heading: 'Prep work separates a good siding job from a bad one',
      paragraphs: [
        'The quality of a siding installation is determined before the first piece goes up. The old siding must be removed, the sheathing inspected, housewrap applied, flashings at windows, doors, and penetrations properly installed, and any damage repaired. Skipping any of these steps means the new siding is hiding problems that will get worse over time.',
        'Rot and water damage are common discoveries under old siding, especially around windows, doors, and the bottom edge of walls. A responsible quote will address how these discoveries are handled, usually with a time-and-materials allowance or a stated price per repair area.',
        'Insulation is another consideration. Many siding installations include a layer of rigid foam insulation board under the new siding, which improves the home\'s thermal envelope. This adds material cost but can reduce energy bills and improve comfort in the rooms behind the siding.'
      ]
    },
    {
      heading: 'Color, finish, and profile choices have cost implications',
      paragraphs: [
        'Factory-finished siding (vinyl, fiber cement with baked-on finish, or pre-primed engineered wood) tends to last longer between repaints and costs more upfront. Field-painted siding can save money at install time but requires repainting sooner, especially on the sun-exposed sides of the house.',
        'The profile of the siding also matters. Horizontal lap is the most common and generally efficient to install. Vertical siding, shingle-style, board-and-batten, or mixed profiles add visual interest but also add installation time and material waste.',
        'Dark colors on fiber cement or vinyl can lead to heat-related issues like warping (vinyl) or increased expansion/contraction (fiber cement). Some manufacturers limit warranty on dark colors. These are not dealbreakers, but they should be discussed with the contractor before finalizing material selection.'
      ]
    },
    {
      heading: 'Timing, permits, and contractor coordination',
      paragraphs: [
        'Siding installation is weather-dependent. Cold temperatures can affect curing of caulks, sealants, and some adhesives. Rain delays are common. A realistic schedule accounts for weather windows, especially in climates with short construction seasons.',
        'Permits are typically required for siding replacement, and an inspection may cover sheathing attachment and flashing details before the siding goes on. A contractor who handles the permit process will charge for permit fees and the time involved, which is normal.',
        'Get a custom estimate for your specific home, upload a photo and we will build the brief. Naili helps you organize the project scope, material preferences, and contractor questions so you can get more useful, comparable siding proposals.'
      ]
    },
    {
      heading: 'How to compare siding quotes fairly',
      paragraphs: [
        'Make sure each quote specifies the same material product line, not just the same material type. A quote for builder-grade vinyl with thin profiles is not comparable to a quote for premium vinyl with insulation and thicker gauge.',
        'Check whether the quote includes removal and disposal of old siding, new housewrap, flashings, trim, soffit, fascia, and any paint or finish work. The difference between a bare material quote and a fully installed system quote can be significant.',
        'Ask about crew size and supervision. Siding is a project where attention to detail across hundreds of pieces of trim and flashing determines long-term performance. A contractor who runs a well-supervised crew is worth more than one who leads on price alone.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Can I install new siding over old siding?',
      answer: 'Sometimes, but it hides potential moisture issues, complicates trim and window details, and may void the new siding warranty. Removal is generally recommended.'
    },
    {
      question: 'What siding material is lowest maintenance?',
      answer: 'Fiber cement with factory finish and premium vinyl with through-color technology both require less ongoing maintenance than wood or OSB-based products.'
    },
    {
      question: 'Does siding improve energy efficiency?',
      answer: 'It can, especially if old siding is removed and continuous insulation is added. The improvement comes from air sealing, housewrap, and insulation board, not the siding itself.'
    },
    {
      question: 'How long should siding last?',
      answer: 'Fiber cement often lasts 30-50 years, premium vinyl 20-40 years, and wood or engineered wood 15-30 years depending on climate and maintenance.'
    }
  ],
  sources: getPricingPublicSources('siding'),
} as CostGuide;
