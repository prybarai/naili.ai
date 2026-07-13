import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'basement-finishing-cost',
  title: 'How much does basement finishing cost?',
  description: 'A straightforward guide to basement finishing costs, from waterproofing and basic finish to a full living space with egress windows, a bathroom, and a bar. Scope matters more than square footage.',
  heroImage: '',
  heroAlt: 'Finished basement with warm-toned flooring, recessed lighting, a seating area, and drywall walls.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Basement finishing is one of the most effective ways to add livable square footage, but the budgets vary wildly because basements start from very different conditions. A dry, clean, high-ceilinged basement that just needs framing and finishes is one project. A damp, low-ceilinged basement with sump pumps, column obstructions, and stair issues is another.',
    'For planning, waterproofing and moisture control alone can run $2,000 to $10,000 depending on severity. A basic basement finish with an open layout and standard finishes typically lands between $15,000 and $35,000. A premium finish with a bathroom, bedroom, egress windows, a wet bar, and custom details starts at $35,000 and climbs well beyond.',
    'The budget mistake most homeowners make is treating basement finishing like above-grade construction. Basements have different moisture dynamics, different code requirements, and different insulation and vapor barrier rules. Ignoring those differences leads to moldy carpet, musty drywall, and regrets within a few years.'
  ],
  ranges: getPricingPlanningRanges('basement'),
  budgetFactors: [
    { item: 'Moisture and waterproofing', impact: 'High', note: 'Basements with moisture issues, inadequate drainage, or high water tables need waterproofing solutions before any finish work can start.' },
    { item: 'Plumbing and bath installation', impact: 'High', note: 'Adding a bathroom to a basement requires a sewage ejector pump, new drain lines, and often excavation of the concrete slab. This alone can add $5,000 to $10,000.' },
    { item: 'Egress windows and ceiling height', impact: 'Medium', note: 'If the basement lacks egress windows for bedrooms or has low ceiling height requiring bulkheads or excavation, both scope and cost increase meaningfully.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Verify the moisture plan — does the quote include vapor barrier, sump pump maintenance or upgrade, and drainage before finish work?',
    'Confirm whether the budget accounts for egress windows if bedrooms are planned — they are non-negotiable for code compliance.',
    'Check insulation type — basement walls need closed-cell foam or rigid foam, not fiberglass batts pressed against concrete.',
    'Ask about column and mechanical wrapping — exposed posts, ductwork, and utility runs need clean finished enclosures that are often excluded from initial estimates.',
  ],
  sections: [
    {
      heading: 'Fix the moisture problem before thinking about finishes',
      paragraphs: [
        'Any basement finishing project starts with one question: is the basement dry? If there is any history of water intrusion, musty smells, efflorescence on walls, or a high water table, moisture control needs to be addressed first. Interior drainage systems, sump pumps, vapor barriers, and sometimes exterior waterproofing are the foundation everything else rests on.',
        'Even if the basement looks dry, a proper finish should include a vapor barrier under any flooring and closed-cell spray foam or rigid foam insulation on the walls and rim joists. Fiberglass batts against concrete walls are a moisture trap, not an insulation solution. The small premium for proper insulation pays for itself by preventing the mold that would otherwise appear in year three.',
        'Dehumidification should also be part of the plan. If the basement does not have a properly sized conditioned air supply, a permanently installed dehumidifier with a drain connection is necessary to keep humidity levels in check.'
      ]
    },
    {
      heading: 'Square footage matters, but finishes and features matter more',
      paragraphs: [
        'A simple open rec room with carpet, painted walls, drop ceiling, and basic lighting is much cheaper than a basement with multiple rooms, a full bathroom, a wet bar, home theater wiring, and custom built-ins. The features packed into the space drive the cost more than the raw square footage.',
        'Adding a bathroom to a basement is one of the biggest individual cost drivers. Since the drains are below the sewer line, a sewage ejector pump must be installed, which means cutting the slab, running new vent and drain lines, and adding a sump-style pump pit. That scope easily adds $5,000 to $10,000, even before tile, fixtures, and finishes.',
        'Egress windows are the second big feature cost. Any bedroom in a basement requires an egress window that meets size and opening requirements. Installing an egress window in a poured concrete or block wall involves cutting the foundation, excavating the well outside, and installing a window well and cover. Each egress window typically runs $2,000 to $4,500 installed.'
      ]
    },
    {
      heading: 'Obstructions, columns, and low ceilings are real budget variables',
      paragraphs: [
        'Few basements are perfectly open boxes. Columns, HVAC ductwork, plumbing chases, and structural beams all need to be boxed in, framed around, or designed into the finished layout. Wrapping columns and building bulkheads for ducts adds framing, drywall, and trim cost that above-grade rooms do not have.',
        'Low ceilings also add cost. If the basement has less than seven feet of clearance, you may need to jackhammer the slab for deeper headroom, which is an expensive path. Many homeowners instead accept bulkheads where ductwork hangs low and keep the ceiling height where it is, but that requires careful planning of furniture and room layouts.',
        'Stairs are another factor often overlooked. If the existing basement stairs are steep, narrow, or damaged, bringing them up to code or making them more usable adds cost to the project before any finish work begins.'
      ]
    },
    {
      heading: 'Mechanical systems and utilities need room too',
      paragraphs: [
        'The furnace, water heater, electrical panel, sump pump, and utility connections take up space and must remain accessible after finishing. A smart basement layout creates a utility room or mechanical closet that keeps those elements accessible while hiding them from the finished space.',
        'Running conditioned air supply into the basement also matters. If the existing HVAC system does not already serve the basement, adding supply registers and a return is necessary to keep the finished space comfortable. This often means extending ductwork, adding zones, or installing a mini-split system for smaller spaces.',
        'Get a custom estimate for your specific basement, upload a photo and we will build the brief. Naili helps you describe the current conditions, desired rooms, and moisture history so contractors can give you a more accurate starting number.'
      ]
    },
    {
      heading: 'How to compare basement finish quotes',
      paragraphs: [
        'Ask each contractor to separate moisture-proofing and insulation from finishes, plumbing, and electrical work. Basement quotes vary wildly depending on what waterproofing assumptions are baked in, so you want to see those line items clearly rather than buried in a lump sum.',
        'Confirm the quote addresses subfloor, flooring type, vapor barrier, insulation method, ceiling system, lighting layout, column enclosures, egress scope, and any stair improvements. Each of these can be missing from some quotes and included in others, making the totals impossible to compare fairly.',
        'Also ask about contingency for hidden conditions. Basements hide surprises well — old drain leaks, cracked footings, radon elevations, and buried debris appear once work begins. A responsible contractor will explain how those are handled rather than pretending they never happen.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How much does it cost to add a bathroom to a basement?',
      answer: 'A basement bathroom typically adds $5,000 to $10,000 including slab cutting, sewage ejector pump, drain lines, venting, fixtures, and finishes.'
    },
    {
      question: 'Do I need a permit for finishing a basement?',
      answer: 'Yes, in almost all jurisdictions. Permits cover framing, electrical, plumbing, egress, insulation, and mechanical work. Unpermitted work can cause issues when selling the home.'
    },
    {
      question: 'What is the best flooring for a basement?',
      answer: 'Luxury vinyl plank or tile is the most reliable choice. It handles moisture, temperature changes, and subfloor irregularities better than hardwood, laminate, or carpet.'
    },
    {
      question: 'How long does a basement finish take?',
      answer: 'A basic 500-800 square foot finish typically takes 6-10 weeks. A more complex finish with plumbing, multiple rooms, and custom work can take 12-16 weeks or longer.'
    }
  ],
  sources: getPricingPublicSources('basement'),
} as CostGuide;
