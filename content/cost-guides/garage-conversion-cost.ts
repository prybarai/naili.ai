import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'garage-conversion-cost',
  title: 'How much does a garage conversion cost?',
  description: 'A practical breakdown of garage conversion costs for ADUs, home gyms, workshops, and living spaces, including insulation, electrical, HVAC, flooring, and permits.',
  heroImage: '',
  heroAlt: 'Converted garage transformed into a bright home office with finished walls, flooring, and large windows.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Garage conversion is one of the most cost-effective ways to add livable square footage to your home. Because the structure already exists with a roof, foundation, and walls, the cost per square foot is roughly half that of a traditional room addition.',
    'A basic garage-to-living-space conversion without plumbing typically runs $10,000 to $25,000 for a standard two-car garage. Adding a bathroom and kitchenette for an ADU pushes the cost to $35,000 to $75,000 or more. The final cost depends on finishes, systems upgrades, and local permitting requirements.',
    'The most important first step is checking with your local building department. Many jurisdictions have specific rules about garage conversions covering parking replacement, setbacks, ceiling height, egress windows, and minimum unit sizes. A permit that gets denied after construction is the most expensive mistake possible.'
  ],
  ranges: [
    { label: 'Basic garage-to-room conversion', range: '$10,000 to $25,000', note: 'Insulation, drywall, flooring, lighting, basic electrical outlets, and paint. No plumbing or structural changes.' },
    { label: 'Garage conversion with bathroom', range: '$25,000 to $50,000', note: 'Adds a 3-piece bathroom, upgraded electrical panel, HVAC extension, and permits.' },
    { label: 'Full ADU conversion with kitchen', range: '$45,000 to $75,000+', note: 'Complete living unit with kitchen, bathroom, separate entrance, all systems upgraded, and impact fees.' },
    { label: 'Home gym or workshop conversion', range: '$5,000 to $15,000', note: 'Insulated walls and ceiling, rubber flooring, heavy-duty electrical, ventilation, and storage systems.' },
  ],
  budgetFactors: [
    { item: 'Plumbing addition', impact: 'High', note: 'Adding a bathroom or kitchen requires running supply and waste lines, which means cutting the slab or tying into existing plumbing at real labor cost.' },
    { item: 'Slab condition and insulation', impact: 'High', note: 'Garage slabs are often uninsulated and may need moisture barriers, radiant heating, or a floating subfloor. Raised floors cost more but are warmer.' },
    { item: 'HVAC system extension', impact: 'Medium', note: 'Extending existing ductwork or adding a mini-split system costs $2,000 to $5,000. The existing system must have enough capacity.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the quote includes bringing the space up to residential code: insulation, fire-rated drywall between garage and house, egress windows, and smoke alarms.',
    'Ask whether the slab needs moisture mitigation or insulation and whether a floating subfloor is recommended for comfort and warmth.',
    'Verify that the electrical panel has capacity for the new space. A panel upgrade to 200A may be needed and is a significant cost.',
    'Check local parking requirements. Some jurisdictions require off-street parking replacement before a garage can be converted to living space.',
  ],
  sections: [
    {
      heading: 'Insulation and slab treatment are the foundation of a comfortable space',
      paragraphs: [
        'Garages are not built to residential comfort standards. The walls are often uninsulated, the slab has no vapor barrier, and the garage door itself is a massive thermal leak. Converting the space requires insulating all exterior walls, replacing the garage door with an insulated door and wall, or building a framed wall in front of it.',
        'The garage slab is usually sloped toward the door for drainage, which means it is not level for living space. A self-leveling compound or a raised subfloor system is needed to create a flat, warm floor. Radiant floor heating is an excellent upgrade because garage slabs are already in place and concrete retains heat well.',
        'Ceiling height is another consideration. Standard garage ceiling heights may meet residential code, but if the garage has exposed trusses, there may not be enough room for a finished ceiling. Dropping the ceiling or vaulting the space adds framing and material cost.'
      ]
    },
    {
      heading: 'Plumbing is the biggest variable between a room and an ADU',
      paragraphs: [
        'Adding a bathroom to a garage conversion is the biggest cost multiplier because it requires running hot and cold water supply lines, drain waste vent lines, and potentially cutting into the existing slab to tap into the main sewer line.',
        'If the garage is attached to the house and the existing bathroom or kitchen is on the same wall, plumbing costs are much lower. If the garage is detached or far from existing plumbing, trenching underground for supply and waste lines adds thousands to the project.',
        'A wet wall grouping the bathroom and kitchen fixtures back-to-back minimizes the number of supply and waste lines needed. This is a design choice that significantly reduces ADU conversion cost.'
      ]
    },
    {
      heading: 'Electrical and HVAC: upgrading the systems',
      paragraphs: [
        'A garage typically has minimal electrical: one or two outlets, a light fixture, and maybe a garage door opener. Converting it to a living space requires adding multiple outlet circuits, lighting, ceiling fans or exhaust fans, and potentially dedicated circuits for the bathroom, kitchen, and HVAC.',
        'The existing electrical panel may not have enough capacity to support the new circuits. Upgrading from 100A to 200A service costs $1,500 to $3,000 and is a common requirement for ADU conversions.',
        'For HVAC, extending existing ductwork is ideal but often impractical if the garage is far from the main system or the existing system lacks capacity. Mini-split ductless heat pumps are the most common solution, providing both heating and cooling efficiently. They cost $2,000 to $5,000 installed.'
      ]
    },
    {
      heading: 'Permitting and code requirements cannot be skipped',
      paragraphs: [
        'Garage conversions require building permits, and the requirements vary significantly by jurisdiction. Common code requirements include fire-rated drywall (5/8 inch Type X) on the wall between the garage and the house, egress windows or doors in bedrooms, smoke and carbon monoxide detectors, and minimum ceiling heights.',
        'Parking replacement is a major issue in some areas. If the garage was the only off-street parking, the conversion may require creating a new parking space or driveway area to replace it. This adds to the project cost and may require separate permits.',
        'Some municipalities place limits on the number of ADUs or have minimum square footage requirements. Impact fees are common for new dwelling units. A quick call to your local planning department before designing the conversion can save serious headaches.'
      ]
    },
    {
      heading: 'Garage door removal and wall construction',
      paragraphs: [
        'The garage door must be removed and the opening framed, insulated, and finished to match the rest of the house. This is one of the few structural changes in a basic conversion. The new wall can include windows and a standard entry door for light and access.',
        'If you want to preserve the ability to park in the garage in the future, you can install a track system that allows an insulated wall section to roll or slide into place. This is a specialized system and adds cost, but it preserves flexibility.',
        'The exterior siding and finish on the new wall section must match the existing house. If the original garage was part of the main structure, matching is straightforward. For detached garages, the new wall is simply a continuation of the exterior finish.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Do I need a permit to convert my garage?',
      answer: 'Yes. Garage conversions require building permits for electrical, plumbing, insulation, structural changes, and potentially zoning. Permits protect you and future buyers.'
    },
    {
      question: 'How long does a garage conversion take?',
      answer: 'A basic room conversion takes 3 to 6 weeks. An ADU with kitchen and bathroom takes 8 to 16 weeks depending on scope, permits, and contractor availability.'
    },
    {
      question: 'Does a garage conversion add resale value?',
      answer: 'Yes, finished square footage generally adds value, but losing garage parking may reduce appeal for some buyers. An ADU that generates rental income typically adds the most value.'
    },
    {
      question: 'Can I convert my garage on a slab without heating?',
      answer: 'You can, but the space will be cold in winter and may not pass code for habitable space without heating. A mini-split or extending ductwork is the typical solution.'
    }
  ],
  sources: [
    { label: 'International Code Council (IRC) Garage Conversion Requirements', url: 'https://www.iccsafe.org/' },
    { label: 'HUD ADU Guide for Homeowners', url: 'https://www.hud.gov/' },
  ],
} as CostGuide;
