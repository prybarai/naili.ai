import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'ac-unit-installation-cost',
  title: 'How much does AC unit installation cost?',
  description: 'A practical breakdown of AC and central air installation costs for split systems, ductless mini-splits, package units, ductwork, and SEER ratings.',
  heroImage: '',
  heroAlt: 'Central air conditioning condenser unit installed on a concrete pad outside a home with copper refrigerant lines.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'AC unit installation costs vary by system type, efficiency rating, and whether new ductwork is needed. A standard central air conditioner replacement for an existing system with ductwork in place runs $3,800 to $8,000, while a full new system including ductwork can cost $7,000 to $15,000 or more.',
    'Ductless mini-split systems are growing in popularity and cost $3,000 to $5,000 per zone installed. They are ideal for homes without existing ductwork, additions, and spaces where extending ductwork is impractical. A multi-zone mini-split for a whole home costs $8,000 to $20,000.',
    'The SEER rating (Seasonal Energy Efficiency Ratio) is the key metric for comparing efficiency and operating cost. Higher SEER units cost more upfront but save on monthly bills. Federal minimum efficiency standards are 14-15 SEER, with high-efficiency models reaching 20+ SEER.'
  ],
  ranges: [
    { label: 'Central AC replacement (existing ducts)', range: '$3,800 to $8,000', note: 'Replace condensing unit and air handler. 14-16 SEER. Includes line set flush, refrigerant, and startup.' },
    { label: 'Complete central AC with new ductwork', range: '$8,000 to $15,000', note: 'Full system installation including new ductwork in unconditioned space. Higher SEER models available.' },
    { label: 'Ductless mini-split (single zone)', range: '$3,000 to $5,000', note: 'Wall-mounted indoor unit, outdoor condenser, refrigerant line, and electrical connection. Ideal for room additions or converted spaces.' },
    { label: 'Multi-zone ductless mini-split', range: '$8,000 to $20,000+', note: '3-5 indoor zones on one outdoor condenser. Requires line set runs and electrical for each zone. Higher efficiency options.' },
    { label: 'Package unit (rooftop or ground)', range: '$5,000 to $12,000', note: 'All-in-one heating and cooling unit. Common in warmer climates and mobile homes. Includes duct connection.' },
  ],
  budgetFactors: [
    { item: 'System efficiency (SEER rating)', impact: 'High', note: 'Higher SEER units (16+ SEER) cost 20% to 50% more than minimum-efficiency units but save on monthly energy bills.' },
    { item: 'Ductwork condition and sizing', impact: 'High', note: 'Existing ductwork must be properly sized for the new unit. Leaky, undersized, or uninsulated ducts reduce efficiency and may need replacement.' },
    { item: 'Refrigerant type and line set', impact: 'Medium', note: 'New systems use R-410A or R-32 refrigerants. Older R-22 systems are being phased out and are expensive to service.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the SEER rating, brand, and model number. Compare BTH ratings and efficiency, not just the price tag.',
    'Ask whether the quote includes line set replacement or reuse. Reusing old line sets with new refrigerant can cause performance issues.',
    'Check whether the electrical work is included. New AC units may need a dedicated circuit, disconnect, and wiring from the panel.',
    'Clarify warranty coverage: manufacturer compressor warranty (10-12 years typically), parts warranty, and contractor labor warranty.',
  ],
  sections: [
    {
      heading: 'Central AC replacement vs. new installation',
      paragraphs: [
        'Replacing an existing central AC system is the most straightforward installation because the ductwork, electrical, and refrigerant lines are already in place. The contractor removes the old condensing unit and air handler, installs new equipment, runs a new line set, and commissions the system.',
        'New installations where no AC existed before require adding ductwork to the home, which is the biggest cost variable. Ductwork in an unconditioned attic or crawlspace costs $2,000 to $5,000 depending on home size, layout, and insulation requirements.',
        'Proper load calculation is essential for both replacements and new installations. The Manual J load calculation determines the correct system size for your home. An oversized unit short-cycles and dehumidifies poorly. An undersized unit runs continuously and struggles to cool on hot days.'
      ]
    },
    {
      heading: 'SEER ratings and energy efficiency trade-offs',
      paragraphs: [
        'The SEER rating measures cooling output divided by electrical input over a typical cooling season. Minimum federal efficiency is 14 SEER for residential systems in most regions, with standards rising to 15 SEER under newer regulations. High-efficiency models reach 18 to 26 SEER.',
        'A jump from 14 SEER to 16 SEER typically adds 15% to 25% to the equipment cost but reduces energy consumption by roughly 12% to 15%. The payback period depends on your cooling season length and local electricity rates. In hot climates with long cooling seasons, higher SEER units pay for themselves in 3 to 6 years.',
        'Two-stage and variable-speed compressors offer additional efficiency and comfort benefits beyond the SEER rating. They run at low speed most of the time, ramping up only when needed. This provides better humidity control, quieter operation, and more even temperatures than single-stage units.'
      ]
    },
    {
      heading: 'Ductless mini-splits offer flexibility without ductwork',
      paragraphs: [
        'Ductless mini-split systems consist of an outdoor condenser connected to one or more indoor air handlers by refrigerant lines. Each zone is individually controlled, allowing different temperatures in different rooms. This is the most efficient way to cool spaces without existing ductwork.',
        'Single-zone mini-splits are ideal for room additions, converted garages, sunrooms, or home offices where extending ductwork is expensive or impractical. Multi-zone systems can cover an entire home with 3 to 5 indoor units connected to one outdoor condenser.',
        'Mini-splits are also highly efficient because there are no duct losses, which can account for 20% to 30% of energy use in ducted systems. They also provide heating in cold climates through heat pump technology, making them a year-round HVAC solution in moderate climates.'
      ]
    },
    {
      heading: 'Ductwork: the hidden HVAC upgrade',
      paragraphs: [
        'If you are installing central AC for the first time, new ductwork must be designed and installed. In an existing home, this means running metal or flexible duct through the attic, crawlspace, or basement to every room. The number of supply and return runs, duct size, insulation, and trunk line length all affect cost.',
        'For replacement systems, the existing ductwork should be inspected for leaks, sizing, and insulation. Leaky ducts can reduce system efficiency by 20% or more. Duct sealing with mastic or aerosol-based sealants costs $500 to $1,500 and is often a worthwhile investment.',
        'Return air ducting is frequently undersized in older homes. Without adequate return air, the system cannot move enough air to cool properly. Adding return air drops to bedrooms or common areas improves performance and comfort.'
      ]
    },
    {
      heading: 'Refrigerant changes and environmental regulations',
      paragraphs: [
        'R-22 refrigerant has been phased out due to its ozone-depleting properties. If you have an older system with R-22, repairing a leak or adding refrigerant is becoming increasingly expensive. Replacing the entire system with a modern R-410A or R-32 unit is usually more cost-effective in the long run.',
        'R-410A is the current standard refrigerant for residential AC systems. R-32 is the newer, more efficient alternative with lower global warming potential and is becoming more common. R-32 allows for smaller, more efficient compressors and reduced refrigerant charge.',
        'When replacing a system, the old refrigerant must be properly recovered and disposed of by a certified technician. This is included in professional installation quotes. The new system will use a different refrigerant and requires a new line set to ensure compatibility and performance.'
      ]
    }
  ],
  faqs: [
    {
      question: 'What size AC unit do I need for my home?',
      answer: 'Unit size is measured in tons (1 ton = 12,000 BTU). A typical 2,000 sq ft home needs 3 to 5 tons. A Manual J load calculation is the only accurate way to determine the right size.'
    },
    {
      question: 'How long does an AC unit last?',
      answer: 'Central AC units typically last 12 to 17 years. Ductless mini-splits last 15 to 20 years. Regular maintenance extends lifespan significantly.'
    },
    {
      question: 'Should I replace my furnace and AC at the same time?',
      answer: 'Yes, if both systems are over 10-15 years old. Matching systems are more efficient, and replacement of both at once saves on labor compared to separate replacements years apart.'
    },
    {
      question: 'Can I install a mini-split myself?',
      answer: 'Mini-splits require refrigerant handling, vacuum pull, electrical wiring, and precise line set installation. Professional installation is strongly recommended for proper operation and warranty coverage.'
    }
  ],
  sources: [
    { label: 'U.S. Department of Energy Central AC Guide', url: 'https://www.energy.gov/energysaver/central-air-conditioning' },
    { label: 'Energy Star Central AC Ratings', url: 'https://www.energystar.gov/products/heating_cooling/air_conditioning_central' },
  ],
} as CostGuide;
