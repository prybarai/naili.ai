import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'flooring-cost',
  title: 'How much does new flooring cost?',
  description: 'A practical breakdown of flooring costs by material type, room-by-room budgeting, subfloor surprises, and how to compare flooring quotes without getting misled by material price alone.',
  heroImage: '/imagery/cost-guide-flooring.webp',
  heroAlt: 'Warm-toned hardwood flooring in a bright living room with natural light and area rug.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Flooring budgets look simple until you realize that the material is only half the story. The same vinyl plank can quote very differently depending on subfloor condition, room shape, furniture moving, trim work, and how much demolition the old floor requires.',
    'For planning, a single room of carpet or vinyl can run a few hundred to a couple thousand dollars, while whole-home hard-surface installations often land between $4,000 and $12,000 or more. Premium materials like tile, stone, or wide-plank hardwood push higher quickly, especially when installation complexity is high.',
    'The smartest thing you can do is separate material cost from installation cost in your head. That distinction alone will help you compare quotes, understand upgrades, and avoid the trap of comparing apples to oranges across different proposals.'
  ],
  ranges: getPricingPlanningRanges('flooring'),
  budgetFactors: [
    { item: 'Subfloor condition', impact: 'High', note: 'If the subfloor needs leveling, repair, or replacement, labor climbs fast regardless of the finish material.' },
    { item: 'Material choice and grade', impact: 'High', note: 'LVP, laminate, carpet, hardwood, tile, and stone each have very different material and install cost profiles.' },
    { item: 'Demolition and disposal', impact: 'Medium', note: 'Removing old flooring, especially glue-down tile, carpet with many staples, or multiple layers, adds real labor.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm subfloor inspection and any leveling or repair allowances are in writing before comparing bids.',
    'Ask for material and labor broken out separately so you can compare apples to apples.',
    'Clarify who moves furniture, who disposes of old flooring, and what trim/transition work is included.',
    'Check warranty terms for both material and labor — some cheap material quotes void quickly on installation defects.',
  ],
  sections: [
    {
      heading: 'Material choice sets the floor, but installation sets the ceiling',
      paragraphs: [
        'Flooring material pricing runs from budget-friendly carpet and sheet vinyl up through LVP, laminate, engineered hardwood, solid hardwood, tile, natural stone, and specialty products. Each material has a genuine price band, but the installation cost for each one also varies significantly based on prep, layout, and skill level required.',
        'A cheaper material does not always mean a cheaper project. Carpet is inexpensive per square foot until you factor in pad, stretching, seaming, and the fact that it usually needs replacement sooner. LVP and laminate can be cost-effective mid-range choices, but they still require proper subfloor prep or the finished look will disappoint.',
        'Hardwood and tile sit further up the cost spectrum, but they also last longer when installed correctly. The right question is not "what is the cheapest floor?" It is "what floor makes sense for this room, this budget, and this expected timeline in the house?"'
      ]
    },
    {
      heading: 'Subfloor is where flooring budgets really diverge',
      paragraphs: [
        'Two homeowners can choose the exact same finish material and get very different quotes because their subfloor conditions are not the same. Concrete slabs may need moisture mitigation. Wood subfloors may need screw-down, leveling compound, or partial replacement. Old vinyl or tile may have asbestos concerns that change the demolition process entirely.',
        'Flooring contractors price what they can see. But they also know the subfloor can reveal surprises once the old floor is up. A good quote includes language around subfloor prep and how additional work will be handled if revealed during demo. A too-low quote often assumes a perfect subfloor that rarely exists.',
        'If you are budgeting, assume some subfloor work will be needed and price it conservatively. That way, if the subfloor turns out clean, you come in under budget instead of over.'
      ]
    },
    {
      heading: 'Room counts, transitions, and trim quietly add up',
      paragraphs: [
        'The per-square-foot price of flooring can look reasonable until the number of rooms, closets, hallways, and transitions multiplies the labor time. Each room means cutting, fitting, starting and stopping, and potentially joining in doorways. Transition strips between different floor heights or materials add materials and labor.',
        'Baseboard removal and reinstallation, or new baseboard entirely, is another cost that is often estimated separately. Some flooring quotes assume baseboards stay. Some assume new ones. Some assume the existing baseboard is removed and reused. These are meaningfully different scopes.',
        'Door casing undercuts are another detail that matters. If a flooring material changes the finished floor height, every door casing in the path may need to be trimmed. That is not a huge line item individually, but across an entire home it becomes real labor.'
      ]
    },
    {
      heading: 'Whole-home versus room-by-room pricing',
      paragraphs: [
        'Installing flooring across an entire home at once tends to be more efficient per square foot because the crew mobilizes once, the subfloor work can be batched, and the material order covers everything in one trip. Room-by-room projects often cost more per square foot because each room involves separate setup, smaller material orders, and coordination with the homeowner over multiple visits.',
        'That said, whole-home projects also hit a larger total dollar amount, and the installation complexity usually ranges across room types. A big open living area may be fast to install. A hallway with multiple doors, a small bathroom with tight cuts, and a bedroom with closets all behave differently on labor time.',
        'If your budget only covers part of the house now, that is fine. Just be aware that finishing the rest later will cost more per square foot than doing it all at once, and material availability and dye lots may not match perfectly later.'
      ]
    },
    {
      heading: 'How to compare flooring quotes honestly',
      paragraphs: [
        'Ask each flooring pro to break out material cost, labor, subfloor prep, demo, disposal, trim work, transitions, and moving furniture. If one bid includes all of those items explicitly and another is a single per-square-foot number, you are not comparing the same thing yet.',
        'Make sure the exact material product is specified. "Luxury vinyl plank" is not a price. The brand, product line, thickness, wear layer, and attachment method all affect both cost and performance. Comparing quotes without matching product specifics is nearly useless.',
        'Get a custom estimate for your specific space, upload a photo and we will build the brief. Naili helps you organize room dimensions, material preferences, subfloor type, and demolition expectations so every contractor you talk to starts from a more accurate brief.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Is it cheaper to buy flooring and hire install separately?',
      answer: 'Sometimes, but only if the installer is comfortable with that arrangement and material defects, waste, and damage liability are clearly assigned upfront.'
    },
    {
      question: 'Can I install new flooring over old flooring?',
      answer: 'Occasionally, but it usually raises the final floor height, complicates transitions and door swings, and may hide subfloor problems that eventually get worse.'
    },
    {
      question: 'Does flooring add resale value?',
      answer: 'Good-quality, well-installed hard surfaces often appeal to buyers more than worn carpet or dated tile, but the return depends on the house, the market, and whether the choice is broadly appealing.'
    },
    {
      question: 'What flooring holds up best in basements?',
      answer: 'LVP and certain engineered products designed for below-grade use are common choices. Carpet can work with proper subfloor prep, but moisture management must be addressed first.'
    }
  ],
  sources: getPricingPublicSources('flooring'),
} as CostGuide;
