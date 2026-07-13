import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'home-addition-cost',
  title: 'How much does a home addition cost?',
  description: 'A no-fluff guide to home addition costs, from small bump-outs to room additions and master suites. What drives the price, what contractors need to verify, and how to budget realistically.',
  heroImage: '',
  heroAlt: 'New room addition on a single-story home with roof, siding, and window matching the existing structure.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Home additions are among the most expensive and most rewarding projects a homeowner can take on. A small bump-out extending a room by six feet is one thing. A master suite or second-story addition is a fundamentally different project with a fundamentally different budget. Knowing which category yours falls into is the first step to getting a useful estimate.',
    'For planning, a small bump-out that extends an existing room typically runs $20,000 to $50,000. A mid-sized bedroom, office, or family room addition with foundation, roof, and MEP connections usually lands between $50,000 and $100,000. Large additions like a master suite, second story, or full wing addition start at $100,000 and climb depending on finishes, square footage, and site complexity.',
    'The biggest budget trap is underestimating the foundation and roof work. Every addition needs a proper foundation, a roof tie-in, and connections to the house systems. Those structural elements eat a large share of the budget before a single square foot of finished space exists.'
  ],
  ranges: getPricingPlanningRanges('addition'),
  budgetFactors: [
    { item: 'Foundation and roof work', impact: 'High', note: 'Adding foundation, roof framing, and tying into the existing structure consumes a large portion of the budget before any interior finishes start.' },
    { item: 'MEP connections and service upgrades', impact: 'High', note: 'Extending electrical, plumbing, and HVAC to the addition may require service upgrades if the existing panel, water heater, or furnace is already at capacity.' },
    { item: 'Finish level and customization', impact: 'Medium', note: 'Standard finishes keep the budget predictable. Custom millwork, premium flooring, high-end fixtures, and specialty glass or doors drive costs up faster than square footage alone.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the foundation type, roof tie-in approach, and structural engineering are all reflected in the quote, not assumed as allowances.',
    'Check whether the HVAC, electrical panel, and water heater have capacity to serve the addition or if a service upgrade is needed.',
    'Ask about demolition, disposal, and site restoration — especially if the addition requires removing existing structure, trees, or landscaping.',
    'Clarify the permit process and who handles engineering stamps, structural calculations, and code inspections from start to finish.',
  ],
  sections: [
    {
      heading: 'The structure costs more than the finishes',
      paragraphs: [
        'Many homeowners imagine their addition budget going toward nice floors, a vaulted ceiling, or a spa-like bathroom. In reality, a large percentage of the budget goes into things you will never see: the foundation, the roof framing, the wall sheathing, the weather barrier, and the connections that tie the new structure to the old one.',
        'A slab-on-grade foundation is less expensive than a full basement or crawlspace, but it still requires excavation, gravel, vapor barrier, rebar, concrete, and inspection. A second-story addition adds complexity in structural loading, stair connections, and getting the roof to work with the existing house geometry.',
        'Roof tie-ins are another structural cost that surprises homeowners. Flashing a new roof into an existing roofline, matching pitch and materials, and ensuring water is directed properly takes careful framing and detail work. A bad tie-in leads to leaks that appear years later and are hard to diagnose.'
      ]
    },
    {
      heading: 'Small bump-outs and mid-sized additions are different projects',
      paragraphs: [
        'A bump-out that extends an existing room by four to eight feet is a relatively contained project. The existing roof line may extend, the foundation work is smaller, and MEP connections are usually short runs from nearby systems. The per-square-foot cost is higher than a full room addition because the fixed costs of mobilization, permits, and structural engineering are spread over fewer square feet.',
        'A mid-sized room addition — a new bedroom, home office, or family room — requires a full foundation, new roof section, and new wall framing. The per-square-foot cost is often lower than a bump-out because the structural scope is spread over more area, but the total cost is higher because there is more of everything.',
        'The key difference is that a bump-out can sometimes keep the existing roofline intact while a room addition always creates a new roof area that must be tied into the existing one. That roof intersection is one of the most expensive details in any addition project.'
      ]
    },
    {
      heading: 'MEP systems can force budget upgrades you were not planning for',
      paragraphs: [
        'Electrical, plumbing, and HVAC are often treated as small parts of the addition budget, but they can become major cost drivers if the existing systems are at capacity. If the electrical panel is full, adding circuits for the addition means a panel upgrade or subpanel, which adds $1,500 to $3,000 before the first outlet is wired.',
        'Plumbing is simpler if the addition is near existing bathrooms or kitchens, but a new bathroom in a far corner of the house means long supply and drain runs, venting, and sometimes threading pipes through existing walls and floors. Those runs add significant material and labor.',
        'HVAC is the trickiest. If the existing system is sized for the current square footage and well-insulated envelope, it probably cannot handle another 500 or 1,000 square feet. Options include upsizing the existing unit, adding a mini-split zone, or designing a dedicated system for the addition. Each option has different upfront and operating costs.'
      ]
    },
    {
      heading: 'Zoning, setbacks, and permitting are non-negotiable',
      paragraphs: [
        'Before any design work starts, the property must be checked for zoning compliance. Setback requirements, lot coverage limits, height restrictions, and easements dictate what can actually be built. Many homeowners pay for a design only to discover the addition cannot be built where they planned. Check zoning first.',
        'Permitting requirements for additions are typically the most rigorous of any home renovation. Plans need structural calculations, energy code compliance, and sometimes engineering stamps. The permit process itself can take weeks or months depending on the jurisdiction and the complexity of the addition.',
        'If the addition is in an HOA or historic district, there may be additional approvals for exterior materials, window styles, and rooflines. Those approvals should be obtained before final pricing, not discovered mid-project when changes are expensive.'
      ]
    },
    {
      heading: 'How to evaluate addition bids honestly',
      paragraphs: [
        'Ask each contractor to break out structural work (foundation, roof, framing, engineering), interior finishes, MEP scope, permits, and site work. A lump-sum number for an addition is not useful for comparison if the underlying assumptions about foundation type, roof complexity, and finish level are different.',
        'Pay attention to how allowances are set. If the quote uses a $10 per square foot allowance for flooring and you plan to install $18 per square foot stone, that difference multiplies across the whole addition. The same applies to cabinets, counters, plumbing fixtures, lighting, and doors.',
        'Get a custom estimate for your specific addition, upload a photo and we will build the brief. Naili helps you organize the design scope, property constraints, and desired finishes so you can get useful bids instead of vague ranges.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Does a home addition add resale value?',
      answer: 'It can, but only if the addition makes sense for the neighborhood. Adding a master suite to a three-bedroom house in a neighborhood of four-bedroom homes is usually a positive. Adding a fifth bedroom to a house that already has four may not recover its cost.'
    },
    {
      question: 'Is it cheaper to build up or out?',
      answer: 'Building out (single-story addition) is generally cheaper than building up (second story). Second-story additions require structural reinforcement of the first floor, stair construction, and more complex roofing work.'
    },
    {
      question: 'Do I need an architect for a home addition?',
      answer: 'For anything beyond a small bump-out, yes. An architect or design-build firm handles structural design, code compliance, zoning, and permit drawings that a general contractor cannot typically provide.'
    },
    {
      question: 'How long does a home addition take?',
      answer: 'A small bump-out takes 8-12 weeks. A mid-sized room addition takes 12-20 weeks. A master suite or second story can take 4-8 months or longer depending on complexity.'
    }
  ],
  sources: getPricingPublicSources('addition'),
} as CostGuide;
