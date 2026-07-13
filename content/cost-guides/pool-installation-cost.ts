import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'pool-installation-cost',
  title: 'How much does pool installation cost?',
  description: 'A practical breakdown of pool installation costs by type, size, materials, and what to expect for in-ground, above-ground, fiberglass, concrete, and vinyl liner pools.',
  heroImage: '',
  heroAlt: 'In-ground concrete swimming pool with clear blue water, tanning ledge, and landscaping.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Pool installation is a major investment that ranges from a few thousand dollars for an above-ground pool to well over $100,000 for a custom in-ground concrete pool with all the features. The pool type, access, soil conditions, and finish quality all drive the final cost.',
    'Typical in-ground pool installation runs $50,000 to $100,000 for a standard size with basic features. Fiberglass pools are at the lower end of that range, concrete/gunite pools at the higher end, and vinyl liner pools in the middle. Above-ground pools cost $3,000 to $15,000 installed.',
    'Beyond the pool itself, you need to budget for landscaping, fencing, decking, pool covers, heaters, and ongoing maintenance. These ancillary costs can add 20% to 40% to the total project.'
  ],
  ranges: [
    { label: 'Above-ground pool (standard)', range: '$3,000 to $15,000', note: 'Round or oval, steel or resin frame, includes pump, filter, and basic ladder. Do-it-yourself or professional install.' },
    { label: 'In-ground fiberglass pool', range: '$55,000 to $85,000', note: 'Pre-formed fiberglass shell installed in excavated hole. Faster install, lower maintenance, limited shapes.' },
    { label: 'In-ground concrete/gunite pool', range: '$70,000 to $120,000+', note: 'Custom shape and depth, gunite or shotcrete construction. Longest-lasting pool type with most design flexibility.' },
    { label: 'In-ground vinyl liner pool', range: '$50,000 to $75,000', note: 'Steel or polymer wall panels with vinyl liner. Lower initial cost than concrete but liner replacement every 10-15 years.' },
    { label: 'Pool decking and equipment', range: '$8,000 to $25,000+', note: 'Concrete, paver, or travertine coping and decking. Heater, salt system, cover, and automation add significantly.' },
  ],
  budgetFactors: [
    { item: 'Soil conditions and site access', impact: 'High', note: 'Rocky soil, high water table, limited equipment access, and demolition of existing structures all add excavation cost.' },
    { item: 'Pool size and shape complexity', impact: 'High', note: 'Rectangular pools are cheapest. Freeform, vinyl, and pools with tanning ledges, spas, or water features cost more.' },
    { item: 'Finishes and equipment features', impact: 'Medium', note: 'Plaster or pebble finish, salt chlorination, automatic covers, variable-speed pumps, and LED lighting all add cost.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask for a complete line-item breakdown: excavation, gunite/shell, plumbing, electrical, coping, decking, and equipment.',
    'Confirm soil testing and groundwater management are included in the excavation bid, not treated as unforeseen extras.',
    'Check warranty terms: concrete/gunite pools typically have structural warranties, fiberglass has shell warranties, vinyl liner pools have liner warranties.',
    'Clarify which features are included: pump, filter, heater, cleaner, cover, fencing, lighting, and automation vs. optional upgrades.',
  ],
  sections: [
    {
      heading: 'Concrete and gunite pools offer maximum design freedom',
      paragraphs: [
        'Concrete or gunite pools are the most popular in-ground pool type because they can be built in any shape, size, or depth. The construction involves spraying a concrete mixture over a steel rebar framework, then applying a waterproof finish like plaster, pebble, or quartz.',
        'The construction takes 8 to 12 weeks on average, significantly longer than fiberglass or vinyl liner pools. Most of that time is spent on excavation, steel work, gunite application, and curing before the finish can be applied.',
        'Concrete pools are the most durable option, with a lifespan of 50 years or more when properly maintained. The trade-off is higher upfront cost, longer construction time, and more maintenance, including acid washing and replastering every 10 to 15 years.'
      ]
    },
    {
      heading: 'Fiberglass pools deliver faster installation at lower cost',
      paragraphs: [
        'Fiberglass pools arrive as a pre-formed shell manufactured off-site, then delivered and lowered into an excavated hole. The installation can take as little as 2 to 4 weeks because the shell is built in a factory, ready to go.',
        'The gel-coat finish is non-porous and resists algae growth, making fiberglass pools lower-maintenance than concrete. The surface is also smoother and more comfortable on bare feet than plaster. Repairing a fiberglass shell can be challenging if it cracks.',
        'The main limitation is shape. Fiberglass pools come in a limited range of predesigned shapes and sizes, typically ranging from 28 to 40 feet in length. Custom fiberglass molds are possible but expensive, so this option works best if one of the standard shapes suits your yard.'
      ]
    },
    {
      heading: 'Vinyl liner pools offer a middle ground',
      paragraphs: [
        'Vinyl liner pools use a flexible vinyl membrane supported by steel, aluminum, or polymer wall panels and a concrete or sand floor. They cost less than concrete upfront and offer more shape options than fiberglass.',
        'The vinyl liner lasts 10 to 15 years before it needs replacement, which costs $4,000 to $7,000 typically. The liner is susceptible to punctures from sharp objects, pool toys, and pets, though modern 30-gauge liners are quite durable.',
        'One advantage of vinyl liner pools is the smooth, non-abrasive surface that is gentle on skin and swimsuits. They are also easier to keep clean than concrete pools because algae has a harder time adhering to the vinyl surface.'
      ]
    },
    {
      heading: 'Above-ground pools are the budget-friendly entry point',
      paragraphs: [
        'Above-ground pools cost a fraction of in-ground pools and can be installed in a weekend for DIY models. Professional installation adds $1,500 to $4,000 but ensures proper leveling, electrical, and safety compliance that can be tricky for homeowners.',
        'The pool itself comes in round, oval, or rectangular shapes with steel, aluminum, or resin frames. Resin frames cost more but resist rust and UV damage better than steel. The liner, pump, filter, and ladder are typically included in the package.',
        'Above-ground pools have a shorter lifespan of 10 to 20 years and do not add as much resale value as in-ground pools. But for families on a budget or those unsure of long-term commitment, they provide years of enjoyment at a fraction of the cost.'
      ]
    },
    {
      heading: 'Pool fencing, decking, and landscaping are essential extras',
      paragraphs: [
        'Most jurisdictions require pool fencing with self-closing, self-latching gates that comply with local safety codes. A fence around the pool typically costs $2,000 to $8,000 depending on material and pool perimeter.',
        'Pool decking provides the surrounding hardscape and can range from standard concrete at $6 to $10 per square foot to travertine or pavers at $15 to $25 per square foot. The deck should be slip-resistant and comfortable underfoot in hot weather.',
        'Landscaping for privacy, shade, and aesthetics can range from a few thousand for simple plantings to $10,000 or more for mature trees, lighting, and irrigation. Plan your landscaping budget separately from the pool and deck budget.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How much does it cost to maintain a pool annually?',
      answer: 'Annual maintenance costs typically run $1,500 to $3,500 for chemicals, electricity, water, cleaning supplies, and minor repairs. Saltwater pools have lower chemical costs but higher equipment costs.'
    },
    {
      question: 'Does a pool increase homeowners insurance?',
      answer: 'Yes, adding a pool typically increases liability coverage costs. You may need to increase your liability umbrella. Most insurers expect compliant safety fencing and a locked cover.'
    },
    {
      question: 'How long does pool installation take?',
      answer: 'Fiberglass pools: 2-4 weeks. Vinyl liner pools: 4-8 weeks. Concrete/gunite pools: 8-12 weeks. Above-ground: 1-3 days for professional install.'
    },
    {
      question: 'Do I need a permit for a pool?',
      answer: 'Yes, all pools regardless of type require permits for construction, electrical, fencing, and often a building permit. Your contractor should handle permit applications as part of the installation.'
    }
  ],
  sources: [
    { label: 'Association of Pool & Spa Professionals', url: 'https://www.apsp.org/' },
    { label: 'HomeAdvisor Pool Installation Cost Guide', url: 'https://www.homeadvisor.com/cost/swimming-pools/' },
  ],
} as CostGuide;
