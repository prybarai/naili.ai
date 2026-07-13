import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'french-drain-installation-cost',
  title: 'How much does French drain installation cost?',
  description: 'A practical breakdown of French drain and drainage system costs for interior and exterior applications, sump pumps, yard grading, and downspout extensions.',
  heroImage: '',
  heroAlt: 'French drain installation with perforated pipe wrapped in filter fabric placed in a gravel-filled trench.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'French drains and drainage systems are the most effective solution for redirecting groundwater away from your foundation, preventing basement flooding, and managing soggy yard areas. The cost depends on the drain length, depth, whether it is interior or exterior, and whether a sump pump is needed.',
    'An exterior French drain around a house foundation typically runs $40 to $100 per linear foot installed, with a total of $3,000 to $10,000 for a typical home. Interior French drains or basement drainage systems installed along the footing cost $50 to $75 per linear foot, plus a sump pump.',
    'The most expensive part of any drainage project is the excavation. Trenching through rocky soil, near existing utility lines, or under concrete patios and walkways adds significant cost. A simple yard French drain to move water away from a low spot is much cheaper than a full perimeter foundation drain.'
  ],
  ranges: [
    { label: 'Exterior yard French drain', range: '$20 to $50 per linear ft', note: 'Simple trench drain to dry out a wet yard. Perf pipe in gravel, fabric-wrapped, daylight outlet.' },
    { label: 'Exterior perimeter foundation drain', range: '$40 to $100 per linear ft', note: 'Trench around foundation footing, gravel, perf pipe, drainage board, and fabric. Includes backfill and grading.' },
    { label: 'Interior French drain system', range: '$50 to $75 per linear ft', note: 'Installed along interior footing, covered by new concrete or floor. Includes sump pump and basin.' },
    { label: 'Sump pump installation', range: '$1,000 to $3,000', note: 'Basin, pump, check valve, discharge pipe. Battery backup adds $300 to $800. Includes electrical work.' },
    { label: 'Downspout extension and grading', range: '$200 to $1,500', note: 'Extend downspouts 4-10 feet from foundation. Regrade soil to slope away from house. Pop-up emitters or dry wells extra.' },
  ],
  budgetFactors: [
    { item: 'Excavation depth and soil type', impact: 'High', note: 'Deeper trenches, rocky soil, clay, and high water tables all increase excavation time and equipment needs.' },
    { item: 'Interior vs exterior installation', impact: 'High', note: 'Interior drains cost more due to concrete cutting, floor removal, and restoration. Exterior drains disrupt landscaping but avoid interior mess.' },
    { item: 'Discharge location and permits', impact: 'Medium', note: 'The drain outlet must discharge to an approved location (storm drain, daylight, or dry well). Some municipalities require permits and have discharge restrictions.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the depth of the trench and whether it reaches the footing level for perimeter drains. A drain above the footing will not prevent basement water entry.',
    'Ask about the pipe type: schedule 40 PVC is best, corrugated HDPE is cheaper but can crush or clog over time.',
    'Check whether the pipe is wrapped in filter fabric to prevent silt infiltration and whether gravel is washed (fines-free) to prevent clogging.',
    'Clarify the discharge point for the drain outlet. The outlet must have positive drainage and must be allowed by local code.',
  ],
  sections: [
    {
      heading: 'Exterior French drains redirect water at the source',
      paragraphs: [
        'Exterior French drains are installed around the perimeter of a foundation, at the level of the footing, to intercept groundwater before it reaches the basement wall. The trench is dug to the footing depth, lined with fabric, filled with washed gravel, and a perforated pipe is laid at the bottom.',
        'The excavated soil is typically backfilled over the gravel. The drain daylights at a lower point on the property, or connects to a sump pit if daylight is not possible. The drain must slope at least 1/8 inch per foot to maintain water flow.',
        'The disruption to landscaping is the biggest downside. The trench around a house is usually 2 to 4 feet wide, which means removing and replacing sod, shrubs, flower beds, and hardscaping. Plan for landscaping restoration in your budget.'
      ]
    },
    {
      heading: 'Interior French drains solve basement water problems',
      paragraphs: [
        'Interior French drains also called base perimeter drains are installed along the interior edge of the basement floor, just inside the footing. The concrete floor is cut, a channel is dug along the footing, perforated pipe is laid in gravel, and the floor is repoured.',
        'The drain system collects water that seeps through the wall-floor joint and routes it to a sump pit, where a pump sends it outside. This is a very effective solution for finished basements that already have chronic water entry because it does not require exterior excavation and disruption.',
        'The disadvantage is the loss of finished floor space along the perimeter, typically 6 to 12 inches. The floor restoration involves new concrete and possibly new flooring in the affected area. This makes interior drains a better fit for unfinished basements or basements where the finish is already being replaced.'
      ]
    },
    {
      heading: 'Sump pumps are the heart of any basement drainage system',
      paragraphs: [
        'A sump pump sits in a pit dug below the basement floor and automatically pumps accumulated groundwater out and away from the house. The pit collects water from the perimeter drain tiles and pumps it through a discharge pipe to an approved outlet.',
        'Primary sump pumps are typically pedestal or submersible types. Submersible pumps are quieter, more powerful, and cost more. Pedestal pumps are cheaper and easier to service but are noisier and sit above the pit.',
        'Battery backup sump pumps are strongly recommended. If the power goes out during a storm exactly when water is rising the primary pump stops working. A battery backup automatically activates. Adding a backup system costs $300 to $800 but can prevent thousands in flood damage.'
      ]
    },
    {
      heading: 'Yard drainage solves surface water and soggy lawn issues',
      paragraphs: [
        'Yard French drains are simpler than foundation drains. They are installed in shallow trenches 12 to 24 inches deep to collect surface water from low spots and move it to a suitable outlet like a swale, dry well, or street curb.',
        'A dry well is a pit filled with gravel that allows water to percolate slowly into the surrounding soil. It works best in sandy or loamy soil. In clay soil, dry wells are less effective because water does not drain fast enough between storms.',
        'Downspout extensions are the cheapest drainage improvement. Extending downspouts 4 to 10 feet from the foundation with rigid pipe or pop-up emitters prevents the most common source of basement water. This is a $50 to $200 DIY fix that professional installation can handle for $200 to $500.'
      ]
    },
    {
      heading: 'Grading the yard is the first line of defense',
      paragraphs: [
        'The ground around your foundation should slope away from the house at least 6 inches over 10 feet. If the grading slopes toward the foundation, no drainage system will fully compensate. The water will always find the path of least resistance toward your basement.',
        'Regrading the soil around the house costs $500 to $3,000 depending on how much soil needs to be moved and whether topsoil and sod are needed afterward. It is often done in conjunction with exterior French drain installation but can be a standalone project.',
        'Grading improvements also solve erosion, pooling water, and muddy yard issues. The best drainage strategy is a layered approach: proper grading + extended downspouts + French drain at the foundation = dry basement.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How long does a French drain last?',
      answer: 'A properly installed French drain with filter fabric and washed gravel should last 20 to 40 years. Clogging is the primary failure mode, which is why fabric wrapping and gravel quality matter.'
    },
    {
      question: 'Can I install a French drain myself?',
      answer: 'A yard French drain is a DIY-friendly project if you are comfortable with digging and basic plumbing. Foundation drains are best left to professionals due to depth, utility lines, and structural considerations.'
    },
    {
      question: 'Do French drains need maintenance?',
      answer: 'Exterior drains need periodic inspection of the outlet for blockages. Sump pump systems need annual maintenance: clean the pit, test the pump, check the check valve.'
    },
    {
      question: 'Will a French drain fix my wet basement?',
      answer: 'Yes, if the water is coming from groundwater seepage or hydrostatic pressure. If the water is from a plumbing leak, roof leak, or above-grade infiltration, a French drain will not help.'
    }
  ],
  sources: [
    { label: 'EPA Basement Waterproofing Guide', url: 'https://www.epa.gov/' },
    { label: 'American Society of Drainage Engineers Best Practices', url: 'https://www.asde.org/' },
  ],
} as CostGuide;
