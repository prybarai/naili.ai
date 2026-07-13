import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'driveway-paving-cost',
  title: 'How much does driveway paving cost?',
  description: 'A practical breakdown of driveway paving costs by material type, size, base prep, and what to expect when comparing quotes for asphalt, concrete, paver, and gravel driveways.',
  heroImage: '',
  heroAlt: 'Newly paved asphalt driveway with crisp edges leading up to a modern home with landscaping.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Driveway paving costs vary by material, size, site conditions, and regional labor rates. Asphalt is the most common and cost-effective choice, while concrete offers greater longevity, and pavers deliver the highest-end look at a premium price.',
    'A typical 400-600 square foot asphalt driveway costs $3,000 to $7,000, while the same driveway in concrete runs $5,000 to $12,000. Paver driveways can go from $8,000 to $20,000 or more depending on the pattern and stone type.',
    'The biggest hidden costs are base preparation, grading, and excavation. A driveway with a solid, well-compacted base costs less overall because it lasts longer and requires fewer repairs. Skimping on base prep is the most expensive mistake you can make.'
  ],
  ranges: [
    { label: 'Asphalt driveway (standard)', range: '$3,000 to $7,000', note: '400-600 sq ft, 2-3 inch asphalt over compacted base. Most common residential choice.' },
    { label: 'Concrete driveway (standard)', range: '$5,000 to $12,000', note: '400-600 sq ft, 4 inch slab with wire mesh. Longer lifespan but higher upfront cost.' },
    { label: 'Pavers or interlocking concrete', range: '$8,000 to $20,000+', note: 'Clay brick or concrete pavers on sand base with edge restraints. Premium aesthetic.' },
    { label: 'Gravel or crushed stone', range: '$1,000 to $3,000', note: 'Cheapest option. Requires occasional replenishment and grading. Suitable for rural properties.' },
    { label: 'Resurfacing or sealcoating', range: '$500 to $2,500', note: 'Existing driveway resurfacing with overlay or sealcoat to extend life 3-5 years.' },
  ],
  budgetFactors: [
    { item: 'Base preparation and grading', impact: 'High', note: 'Excavating, compacting, and grading the base layer is the most critical factor in driveway longevity. Poor base leads to cracking and settling.' },
    { item: 'Driveway size and shape', impact: 'High', note: 'Square footage drives material costs. Curves, slopes, and turning radiuses add labor and may require custom forming.' },
    { item: 'Drainage and permeability', impact: 'Medium', note: 'Adding drainage solutions, permeable pavers, or grading for water runoff increases cost but prevents long-term damage.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask for base course thickness and compaction specifications. A minimum 6-8 inch compacted base is standard for asphalt and concrete.',
    'Confirm whether the quote includes excavation, grading, edging, compacting, and cleanup, or if those are separate.',
    'Check warranty terms specifically for cracking, settling, and surface wear. Material-only warranties are less valuable than workmanship warranties.',
    'For concrete, confirm whether reinforcement (wire mesh or rebar), control joints, and finishing details (broom, exposed aggregate, stamped) are included.',
  ],
  sections: [
    {
      heading: 'Asphalt is affordable but requires maintenance',
      paragraphs: [
        'Asphalt or blacktop is the most popular driveway material because it costs less than concrete, installs quickly, and provides a smooth, dark surface. A typical asphalt driveway is 2 to 3 inches thick over a compacted aggregate base.',
        'The trade-off is maintenance. Asphalt needs sealcoating every 3 to 5 years to protect against UV damage, water penetration, and oxidation. Without sealcoating, asphalt becomes brittle, cracks, and deteriorates faster.',
        'Asphalt also softens in extreme heat and can be damaged by heavy vehicles or sharp turning loads on hot days. But for most residential driveways, a well-installed asphalt driveway with regular maintenance lasts 20 to 30 years.'
      ]
    },
    {
      heading: 'Concrete offers durability at a higher initial cost',
      paragraphs: [
        'Concrete driveways cost 40% to 60% more than asphalt upfront but typically last 30 to 50 years with minimal maintenance. A standard driveway uses 4 inches of concrete with wire mesh or rebar reinforcement on a compacted base.',
        'Concrete does not need sealcoating, but it can crack from ground movement, freeze-thaw cycles, or heavy loads if control joints are not properly placed. Control joints allow the concrete to crack in straight, controlled lines rather than random patterns.',
        'Stamped, stained, or exposed aggregate concrete finishes add $3 to $8 per square foot to the standard concrete cost but create a decorative surface that rivals pavers in appearance. Broom finish remains the most affordable and slip-resistant option.'
      ]
    },
    {
      heading: 'Pavers deliver premium appearance with higher installation cost',
      paragraphs: [
        'Interlocking concrete pavers, clay brick, and natural stone create a high-end driveway look with the advantage that individual units can be replaced if damaged. Paver driveways handle freeze-thaw cycles well because the joints allow movement.',
        'The installation requires a deep base 8 to 12 inches of compacted aggregate, 1 to 2 inches of sand bedding, and edge restraints. The paver pattern, shape, and stone type all affect cost. Running bond patterns are cheapest; herringbone and basketweave patterns require more cutting and labor.',
        'Paver driveways require sealing every 3 to 5 years and occasional sand replenishment in the joints. Weed growth between pavers can be an issue in damp climates unless polymeric sand with weed inhibitor is used in the joints.'
      ]
    },
    {
      heading: 'Base preparation is the single most important factor',
      paragraphs: [
        'Regardless of surface material, the base layer determines how long the driveway lasts. A proper base consists of 6 to 12 inches of crushed stone or recycled concrete aggregate, compacted in layers with mechanical equipment.',
        'Poor base preparation is the number one cause of driveway failure. Settling, cracking, rutting, and drainage problems all trace back to inadequate base compaction. A driveway is only as good as the ground beneath it.',
        'Good drainage around and under the driveway prevents water from weakening the base. Driveways should slope slightly toward the street or a drainage swale at a minimum of 1% grade to ensure water runs off rather than pooling.'
      ]
    },
    {
      heading: 'Gravel: the budget-friendly option with trade-offs',
      paragraphs: [
        'Gravel driveways are the most affordable option and work well for rural properties, long driveways, or temporary access roads. Crushed stone with sharp edges packs better than smooth river rock and provides a more stable surface.',
        'The downsides are maintenance and appearance. Gravel needs periodic grading to maintain a flat surface, replenishment as stone gets displaced, and weed management. Dust can be an issue in dry weather, and gravel does not provide a smooth surface for walking or bicycling.',
        'For homeowners on a tight budget or with a very long driveway, gravel can be a practical choice. But for the primary entry to a home where appearance matters, asphalt or concrete usually provides better curb appeal and resale value.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How long does a new driveway take to install?',
      answer: 'Asphalt installation takes 2 to 5 days including base prep and compaction. Concrete takes 5 to 10 days for curing before use. Pavers take 1 to 2 weeks depending on pattern complexity.'
    },
    {
      question: 'Can I pave over an existing driveway?',
      answer: 'Yes, asphalt can be overlaid on existing asphalt if the base is sound. Concrete cannot be poured over asphalt. Pavers may be installed over existing concrete with proper base adjustments.'
    },
    {
      question: 'What is the best driveway material for cold climates?',
      answer: 'Concrete and asphalt both perform well with proper base prep. Pavers are excellent in freeze-thaw climates because individual units can move without cracking the whole surface.'
    },
    {
      question: 'Does a paved driveway add resale value?',
      answer: 'Yes, a well-maintained paved driveway adds curb appeal and is expected by most homebuyers. Gravel driveways may detract from value in suburban settings.'
    }
  ],
  sources: [
    { label: 'National Asphalt Pavement Association', url: 'https://www.asphaltpavement.org/' },
    { label: 'Interlocking Concrete Pavement Institute', url: 'https://www.icpi.org/' },
  ],
} as CostGuide;
