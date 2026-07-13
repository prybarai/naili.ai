import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'landscaping-budget',
  title: 'How much does landscaping cost?',
  description: 'A practical guide to landscaping budgets, from cleanup and planting through hardscaping, irrigation, and full design-build projects, with real cost factors and contractor tips.',
  heroImage: '',
  heroAlt: 'Well-maintained front yard with flower beds, mature trees, and a stone walkway.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Landscaping covers everything from a weekend of clean-up and planting to a full design-build project with hardscape, irrigation, lighting, and drainage. Those are very different budgets, and using the same word for both makes pricing confusing until you define the scope precisely.',
    'For rough planning, basic cleanup and planting often runs between $1,000 and $5,000. A mid-range project with a patio or walkway, irrigation, and thoughtful planting typically lands between $5,000 and $15,000. Full landscape design-build with retaining walls, outdoor living elements, water features, and significant grading starts at $15,000 and climbs quickly.',
    'The biggest landscaping budget mistake is starting with hardscape and running out of money for plants, irrigation, and soil improvement. The order matters. If the hardscape eats the whole budget, you end up with a patio surrounded by mud.'
  ],
  ranges: getPricingPlanningRanges('landscaping'),
  budgetFactors: [
    { item: 'Hardscape scope', impact: 'High', note: 'Patios, walkways, retaining walls, and outdoor kitchens consume the largest share of the budget. Material choice (poured concrete, pavers, natural stone) also drives cost.' },
    { item: 'Grading and drainage', impact: 'High', note: 'If the property has drainage issues, low spots, or significant regrading needs, earthwork and drainage solutions add cost before anything aesthetic happens.' },
    { item: 'Existing plant and bed condition', impact: 'Medium', note: 'Removing overgrown beds, invasive plants, or old hardscape adds disposal and prep time before new planting can start.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm whether the quote includes soil amendments, mulch, and proper planting, or just the plant materials dropped off.',
    'Ask about drainage provisions — downspout extensions, French drains, and grading should be specified, not assumed.',
    'Check the plant warranty period and replacement terms — most reputable landscapers guarantee plants for at least one growing season.',
    'Clarify who handles ongoing irrigation system setup and whether drip vs. spray is included in the base scope.',
  ],
  sections: [
    {
      heading: 'Hardscape sets the floor of any serious landscape budget',
      paragraphs: [
        'Hardscape elements like patios, walkways, retaining walls, driveways, and outdoor kitchens are the biggest cost drivers in landscaping. A poured concrete patio is one price. A paver patio with a pattern, border, and permeable base is another. Natural stone sits higher still. The more hardscape in the plan, the more the budget tilts toward those elements.',
        'Retaining walls add significant cost because they involve structural design, drainage aggregate, geotextile fabric, and sometimes engineering. A low wall for a planter bed is manageable. A tall wall holding back a sloped yard is a serious structural project with excavation, engineered materials, and concrete footings.',
        'Outdoor kitchens, fire pits, and water features each add their own specialized cost buckets. A simple fire pit ring is affordable. A full outdoor kitchen with grill, countertops, sink, and refrigeration is a major installation, often exceeding $10,000 on its own.'
      ]
    },
    {
      heading: 'Plants cost less than hardscape but matter for the finished look',
      paragraphs: [
        'A landscape full of hardscape with a few plants thrown in at the end will look incomplete. The plants, trees, shrubs, groundcovers, and perennials soften the hard surfaces, define the spaces, and give the yard its character. But plants also have ongoing costs — water, mulch, pruning, fertilizing, and eventual replacement.',
        'Native and drought-tolerant plants can reduce water use and long-term maintenance, but the upfront cost is similar to non-native ornamentals. The savings come over time in reduced watering and replacement needs. For homeowners who want low-maintenance landscaping, native plant selection is one of the smartest choices available.',
        'Soil preparation matters too. If the existing soil is compacted clay, thin sand, or construction fill, bringing in amended topsoil or compost before planting makes the difference between plants that thrive and plants that struggle for years.'
      ]
    },
    {
      heading: 'Irrigation and drainage are not optional on most sites',
      paragraphs: [
        'Irrigation systems add upfront cost but can save money in the long run by applying water efficiently. A properly zoned system with drip lines for beds and rotors for turf uses less water than hand watering or mismatched sprinklers. The cost of the system depends on zone count, controller type, and whether the existing water supply requires new connections.',
        'Drainage is the other hidden essential. Downspout extensions, French drains, dry wells, and grading corrections should be part of any landscape plan. Water pooling against the house, in low spots, or over walkways will cause damage and frustration if not addressed during the initial build.',
        'Decking with drainage is far cheaper than retrofitting drainage after the hardscape and planting are done. A few thousand dollars spent on drainage planning during the build can prevent tens of thousands in repairs later.'
      ]
    },
    {
      heading: 'The cost of doing landscaping in phases',
      paragraphs: [
        'Not every homeowner has $15,000 to $30,000 available for a full landscape project. Phasing the work over two or three seasons is a practical approach. Start with drainage and grading, then hardscape, then irrigation and major plantings, then fine details and finishing plants.',
        'The tradeoff of phasing is that each phase has its own mobilization costs, and the final result takes longer to achieve. But phasing also means you can adjust the plan based on how you actually use the yard, which sometimes produces a better outcome than a single design-build sprint.',
        'If you phase, make sure each phase leaves the yard in a usable, not muddy, condition. Hardscape first, then soil prep and major plants, then finishing touches. Leave detailed planting and fine grading for the last phase so that disturbed soil does not wash over new patios or walkways.'
      ]
    },
    {
      heading: 'How to evaluate landscaping bids',
      paragraphs: [
        'Ask each landscaper to separate hardscape, planting, irrigation, drainage, and labor with clearly defined materials and quantities. A line-item bid makes it much easier to spot differences and ask questions than a lump-sum number.',
        'Check whether the quote includes cleanup and hauling of debris, final grading and seeding or sod, and any warranty period for plant establishment. A good landscaper wants to see the plants survive the first summer and will include follow-up care.',
        'Get a custom estimate for your specific property, upload a photo and we will build the brief. Naili helps you describe the space, desired features, and existing conditions so you start every landscaper conversation with more useful information.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Should I do landscaping before or after other renovations?',
      answer: 'After major exterior work like siding, windows, rooflines, or additions. New construction debris and equipment traffic will damage new landscaping.'
    },
    {
      question: 'Do I need a landscape designer or just a contractor?',
      answer: 'For simple planting and hardscape, a good contractor is enough. For complex grading, retaining walls, or custom hardscape layouts, a designer is worth the investment.'
    },
    {
      question: 'What is the most cost-effective way to improve curb appeal?',
      answer: 'Clean up existing beds, add fresh mulch, prune overgrown shrubs, and add a few well-chosen trees or shrubs. That alone can transform the look of a yard.'
    },
    {
      question: 'How much does outdoor lighting add to a landscape project?',
      answer: 'Low-voltage landscape lighting for a typical front yard adds $800 to $2,500 depending on fixture count, transformer quality, and wiring complexity.'
    }
  ],
  sources: getPricingPublicSources('landscaping'),
} as CostGuide;
