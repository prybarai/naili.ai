import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'foundation-repair-cost',
  title: 'How much does foundation repair cost?',
  description: 'A practical breakdown of foundation repair costs by problem type, from crack injection to piering and underpinning, and what to expect when getting structural engineering assessments.',
  heroImage: '',
  heroAlt: 'Concrete foundation wall with visible crack, sealed epoxy injection, and waterproofing membrane installation.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Foundation repair costs range from a few hundred dollars for a simple crack injection to tens of thousands for full structural underpinning. The severity, cause, and location of the problem dictate the solution and the price tag.',
    'Common repairs like epoxy crack injection or carbon fiber wall reinforcement typically run $400 to $1,500 per crack. More involved work like push piers, helical piers, or slab jacking to address settlement can cost $1,500 to $10,000 or more per location.',
    'The single biggest mistake homeowners make is trying to diagnose foundation problems without a structural engineer. A professional assessment costs a few hundred dollars but prevents you from paying for the wrong repair or missing a serious structural issue.'
  ],
  ranges: [
    { label: 'Epoxy or polyurethane crack injection', range: '$400 to $1,500', note: 'Non-structural cracks in poured concrete or block walls. Seals the gap and prevents water intrusion.' },
    { label: 'Carbon fiber wall reinforcement', range: '$600 to $2,500', note: 'Bowed or leaning walls stabilized with carbon fiber straps. Basement or crawlspace applications.' },
    { label: 'Underpinning with push piers or helical piers', range: '$2,000 to $10,000+', note: 'Per pier, depending on depth, soil conditions, and access. Multiple piers usually needed.' },
    { label: 'Slab jacking (mudjacking or polyjacking)', range: '$800 to $3,500', note: 'Sunken or settled concrete slab lifted and stabilized. Polyurethane foam is more expensive but more precise.' },
    { label: 'Interior or exterior waterproofing', range: '$2,000 to $10,000', note: 'French drain system, sump pump, vapor barrier, and wall sealant for basement moisture issues.' },
  ],
  budgetFactors: [
    { item: 'Soil conditions and site access', impact: 'High', note: 'Expansive clay soils, high water tables, and limited equipment access all increase foundation repair complexity and cost.' },
    { item: 'Structural cause versus symptom', impact: 'High', note: 'Treating a symptom (a crack) without addressing the cause (settlement or hydrostatic pressure) leads to recurring problems.' },
    { item: 'Number of piers or injection points', impact: 'Medium', note: 'Most foundation repairs need multiple intervention points. The total cost scales with the number of locations, not just the severity.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Get a structural engineer report before accepting a foundation repair quote. Some contractors recommend repairs that may be more extensive than necessary.',
    'Ask for the number of piers, injection points, or reinforcement straps included, and whether a warranty is backed by the manufacturer or only the installer.',
    'Confirm whether the quote includes landscaping, concrete, or hardscape repair around the foundation after the work is done.',
    'Check whether a post-repair monitoring period or follow-up inspection is included to confirm the repair is holding.',
  ],
  sections: [
    {
      heading: 'Not every crack needs major foundation work',
      paragraphs: [
        'Hairline cracks in poured concrete foundations are common and often result from normal settling or concrete curing. Cracks under 1/8 inch wide that do not grow over time are typically cosmetic and can be sealed with epoxy or polyurethane injection to prevent water entry.',
        'Wider cracks, cracks that grow over time, stair-step cracks in block foundations, horizontal cracks, or cracks accompanied by sticking doors or sloping floors indicate more significant movement. These should be evaluated by a structural engineer.',
        'The cost of a structural engineer inspection $300 to $800 is a fraction of the cost of unnecessary or incorrect repairs. Always invest in the diagnosis before committing to a repair plan.'
      ]
    },
    {
      heading: 'Underpinning and piering address settlement',
      paragraphs: [
        'When a foundation settles into unstable soil, underpinning extends the foundation depth to reach load-bearing soil. Push piers are driven into the ground using hydraulic pressure until they reach stable soil or rock. Helical piers are screwed in like giant augers.',
        'The number of piers needed depends on the size and weight of the structure, the severity of settlement, and soil conditions. A typical corner or wall section may need 3 to 6 piers, with each pier costing $1,500 to $3,500 installed.',
        'Exterior piers generally require excavation around the foundation, which adds cost for digging, backfill, and landscape or hardscape restoration. Interior piers require cutting through the slab or floor, which adds interior finishing work.'
      ]
    },
    {
      heading: 'Slab jacking lifts sunken concrete',
      paragraphs: [
        'Slab jacking or mudjacking involves pumping a grout mixture under a settled concrete slab to lift it back to its original position. It works for driveway aprons, garage floors, walkways, and some interior slabs where the slab is intact but uneven.',
        'Polyjacking uses polyurethane foam instead of grout. It is lighter, sets faster, and is more precise, but costs 20% to 40% more than traditional mudjacking. The choice depends on soil conditions, slab weight, and how much precision is needed.',
        'Slab jacking does not fix the underlying cause of settlement, such as poor soil compaction or drainage issues. If the soil problem is not addressed, the slab may settle again. For structural slabs supporting the home, underpinning is usually the better long-term solution.'
      ]
    },
    {
      heading: 'Wall stabilization for bowing or leaning walls',
      paragraphs: [
        'Basement or crawlspace walls that bow inward are usually under lateral pressure from expansive soil or hydrostatic water pressure. Carbon fiber straps epoxied to the wall are a common, less invasive solution that costs less than steel I-beam reinforcement.',
        'Steel beam reinforcement involves installing vertical steel I-beams against the wall, anchored into the floor and ceiling. It is more expensive but provides greater support for severely bowed walls. Wall anchors are another option that pull from outside.',
        'The choice between carbon fiber, steel beams, and wall anchors depends on the severity of the bowing, soil conditions, and whether the wall is actively moving. A structural engineer should make this recommendation.'
      ]
    },
    {
      heading: 'Waterproofing is often part of the foundation repair solution',
      paragraphs: [
        'Many foundation problems are caused or worsened by water. Poor drainage, gutter downspouts that empty next to the foundation, and hydrostatic pressure in the soil all push water through foundation walls and contribute to settlement and cracking.',
        'An interior French drain system with a sump pump is the most common waterproofing solution for finished basements. It collects water at the footing level and pumps it out before it can accumulate. An exterior waterproofing system with dimple board and drainage mat is more invasive but more effective.',
        'Grading corrections gutters, downspout extensions, and regrading soil to slope away from the foundation are the cheapest waterproofing upgrades you can make. They cost a fraction of interior or exterior drainage systems and address the problem at the source.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How do I know if a foundation crack is serious?',
      answer: 'Cracks wider than 1/8 inch, cracks that grow, horizontal cracks, stair-step cracks in block, or cracks with sticking doors and sloping floors warrant a structural engineer evaluation.'
    },
    {
      question: 'Can I sell a house with foundation problems?',
      answer: 'Yes, but you must disclose known issues. The buyer will factor repair costs into their offer, or require repairs as a condition of sale. Pre-repairing is usually better for sale price.'
    },
    {
      question: 'Does foundation repair have a warranty?',
      answer: 'Most reputable foundation repair companies offer 10-year to lifetime transferable warranties. Always check whether the warranty is manufacturer-backed or installer-backed.'
    },
    {
      question: 'How long does foundation repair take?',
      answer: 'Crack injection takes a few hours and cures in 24 hours. Piering and underpinning typically take 2 to 5 days for installation plus time for concrete to cure. Full wall repairs can take a week or more.'
    }
  ],
  sources: [
    { label: 'Structural Engineers Association', url: 'https://www.seaoo.org/' },
    { label: 'HomeAdvisor Foundation Repair Cost Guide', url: 'https://www.homeadvisor.com/cost/foundations/' },
  ],
} as CostGuide;
