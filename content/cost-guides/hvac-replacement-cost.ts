import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'hvac-replacement-cost',
  title: 'How much does HVAC replacement cost?',
  description: 'A practical guide to the real cost of replacing a furnace, AC, heat pump, or full HVAC system, including efficiency tiers, ductwork, permits, and what changes the price most.',
  heroImage: '/imagery/cost-guide-hvac.webp',
  heroAlt: 'Outdoor HVAC condenser unit against a house exterior with landscaping.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'HVAC replacement pricing spans a wide range because a furnace swap, an AC-only replacement, a full heat pump system, and a zoned multi-head mini-split are very different projects that all get called "HVAC replacement." The equipment matters, but the ductwork condition, fuel type, efficiency level, and local labor rates matter almost as much.',
    'For rough planning, a single furnace or AC unit replacement often falls between $3,500 and $8,000. A full forced-air system with both furnace and AC sits higher, often between $8,000 and $15,000. Premium systems, heat pumps, ducted mini-splits, or work involving new ductwork or zoning can easily run $15,000 or more.',
    'The most common mistake homeowners make is price-shopping without understanding efficiency ratings, equipment sizing, and installation quality. Unlike a light fixture, a poorly installed or mismatched HVAC system costs you every month in higher utility bills, not just once at install time.'
  ],
  ranges: getPricingPlanningRanges('hvac'),
  budgetFactors: [
    { item: 'System type and efficiency', impact: 'High', note: 'Entry-level single-stage equipment is cheaper than variable-speed, modulating, or heat pump systems with higher SEER/AFUE ratings.' },
    { item: 'Ductwork condition', impact: 'High', note: 'If existing ducts are undersized, leaky, or damaged, the cost of modification or replacement can rival the equipment cost itself.' },
    { item: 'Fuel type change', impact: 'Medium', note: 'Switching fuels (gas to electric, or adding a heat pump) involves new lines, permits, and sometimes panel upgrades.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Verify the quote specifies exact equipment brand, model, SEER/AFUE/HSPF efficiency ratings, and warranty terms for both parts and labor.',
    'Ask whether a Manual J load calculation was done to size the equipment properly for your home.',
    'Confirm ductwork inspection, any modifications needed, and what the quote includes for linesets, electrical, permits, and thermostat.',
    'Check warranty registration — some manufacturers require registration within a specific window or the warranty is reduced.',
  ],
  sections: [
    {
      heading: 'Equipment choice matters more than the sticker price',
      paragraphs: [
        'Two quotes for "a new furnace" can differ by thousands of dollars because one is a single-stage 80% AFUE unit and the other is a two-stage or modulating 96% unit with a variable-speed blower. Both are furnaces. They are not the same product, and they will not deliver the same comfort or utility cost.',
        'Heat pumps add another dimension because the efficiency rating (SEER2 and HSPF2) and whether the unit is cold-climate rated affects both upfront cost and year-round performance. In colder regions, a heat pump that maintains capacity at low outdoor temperatures costs more but may eliminate the need for backup heat entirely.',
        'The right approach is not to pick the cheapest or most expensive equipment. It is to match the system to your climate, home size, duct configuration, and how long you plan to stay. A premium system can pay for itself over time in energy savings, but only if you will be in the house long enough to capture those savings.'
      ]
    },
    {
      heading: 'Ductwork often dictates the real project cost',
      paragraphs: [
        'If the existing duct system is in good shape and properly sized for the new equipment, the replacement is relatively straightforward. But many homes, especially older ones, have undersized ducts, leaky connections, or ductwork that was designed for a different type of system entirely.',
        'Duct modifications or replacement adds significant cost and complexity. It may involve attic or crawlspace work, drywall patching, and coordination with other trades. This is also the most common source of surprise change orders after the old system is removed and the installer can actually inspect the duct condition.',
        'A responsible HVAC contractor should inspect the ducts before quoting and include necessary modifications in the proposal. If a quote is dramatically lower than others, one likely reason is that the ductwork assumptions are optimistic.'
      ]
    },
    {
      heading: 'Permits, lines, and electrical add up quickly',
      paragraphs: [
        'HVAC replacement requires electrical work for the new system, and in many areas a permit and inspection. Refrigerant linesets, condensate drains, gas lines, and electrical disconnects all need to meet current code. These are not optional upgrades, and a quote that does not include them may be hiding part of the scope.',
        'Older homes sometimes need a panel upgrade or additional circuits to support a new system, especially when upgrading from a lower-efficiency unit to a higher-performance system with more power draw. That can add materially to the total project cost.',
        'Get a custom estimate for your specific space, upload a photo and we will build the brief. Naili can help you organize the equipment scope, existing system details, and permit requirements so every HVAC contractor starts from the same page.'
      ]
    },
    {
      heading: 'Efficiency ratings: what to actually look for',
      paragraphs: [
        'AFUE (furnace) and SEER2 (AC/heat pump) are the standard efficiency metrics. Higher numbers mean better efficiency, but the real-world savings depend on your climate, usage patterns, and existing equipment condition. Jumping from 80% to 96% AFUE on a furnace saves meaningful fuel over time. Jumping from 14 to 16 SEER on an AC may have a longer payback.',
        'For heat pumps, HSPF2 matters more than SEER2 in colder climates. A heat pump with high HSPF2 and cold-climate certification (like those meeting ENERGY STAR criteria) will perform better in winter conditions. Without good cold-climate performance, the system may rely heavily on backup electric resistance heat, which defeats the efficiency purpose.',
        'Tax credits and utility rebates also affect the math. Federal tax credits may be available for certain efficiency levels, and local utilities often offer additional rebates. A contractor who can help you identify those incentives adds real value even if their base equipment price is not the lowest.'
      ]
    },
    {
      heading: 'How to compare HVAC bids intelligently',
      paragraphs: [
        'Ask for exact model numbers, not just brand names or efficiency tiers. A SEER2 rating alone does not tell you about sound levels, blower type, refrigerant type, or cold-climate performance. Model numbers make comparison possible.',
        'Demand a Manual J load calculation. Any HVAC contractor sizing equipment without one is guessing. Oversized equipment short-cycles and wastes energy. Undersized equipment runs constantly and never fully satisfies the thermostat. Both outcomes are bad.',
        'The cheapest bid in HVAC is often the most expensive over time. Installation quality determines efficiency and longevity as much as the equipment itself. A well-reviewed contractor who does proper commissioning, airflow measurement, and refrigerant charge verification is worth paying more for.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Should I replace furnace and AC at the same time?',
      answer: 'Often yes, because the indoor coil and refrigerant must match the outdoor unit, and pairing mismatched ages leaves half the system at higher failure risk.'
    },
    {
      question: 'How long should an HVAC system last?',
      answer: 'Furnaces average 15-20 years, AC units 10-15 years, and heat pumps 12-15 years with proper maintenance.'
    },
    {
      question: 'Are mini-splits cheaper than ducted systems?',
      answer: 'For new additions or homes without ducts, mini-splits can be cost-effective. For whole-home replacement in a house with existing ducts, a ducted system is usually more practical.'
    },
    {
      question: 'Do HVAC warranties transfer to a new owner?',
      answer: 'Some do, some do not. Check the manufacturer and installer warranty terms if you plan to sell before the system ages out.'
    }
  ],
  sources: getPricingPublicSources('hvac'),
} as CostGuide;
