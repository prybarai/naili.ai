import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'tree-removal-cost',
  title: 'How much does tree removal cost?',
  description: 'A practical breakdown of tree removal costs by tree size, location, condition, and what to expect for stump grinding, emergency removals, and lot clearing.',
  heroImage: '',
  heroAlt: 'Tree removal crew using ropes and climbing gear to safely lower branches from a large oak tree near a house.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Tree removal costs vary dramatically based on tree size, location relative to structures, accessibility, and whether the tree is healthy or damaged. A small tree in an open yard with easy access can cost $200 to $500, while a large tree leaning toward a house requires careful rigging and can cost $1,500 to $5,000 or more.',
    'The tree diameter at breast height (DBH) is the primary pricing metric. Small trees under 30 feet cost $200 to $800. Medium trees 30 to 60 feet run $500 to $1,500. Large trees over 60 feet with significant trunks range from $1,500 to $5,000, and exceptionally large or dangerous trees can run higher.',
    'Stump grinding is usually priced separately and adds $100 to $500 depending on stump size and root structure. Debris removal, emergency service, and permit costs are additional line items that homeowners sometimes overlook when comparing quotes.'
  ],
  ranges: [
    { label: 'Small tree removal (under 30 ft)', range: '$200 to $800', note: 'Small ornamental or young tree, easy access, no structures nearby. Felled whole in manageable pieces.' },
    { label: 'Medium tree removal (30-60 ft)', range: '$500 to $1,500', note: 'Standard residential tree like maple, oak, or pine of moderate size. May need rigging or section felling.' },
    { label: 'Large tree removal (60+ ft)', range: '$1,500 to $5,000+', note: 'Mature shade tree, large trunk diameter, near structures. Requires climbing, rigging, and careful section lowering.' },
    { label: 'Stump grinding', range: '$100 to $500', note: 'Per stump. Price depends on diameter, root structure, and depth of grinding required below grade.' },
    { label: 'Emergency storm damage removal', range: '$500 to $5,000+', note: 'Storm-fallen tree, hazardous hanging limbs, or trees on structures. Premium rates for emergency response and risk.' },
  ],
  budgetFactors: [
    { item: 'Tree size and fall distance', impact: 'High', note: 'Every foot of tree height increases risk, rigging complexity, and cleanup volume. Large trees need more crew, equipment, and time.' },
    { item: 'Proximity to structures and power lines', impact: 'High', note: 'Trees near houses, fences, decks, cars, or power lines need careful section work and rigging, which doubles or triples labor time.' },
    { item: 'Accessibility for equipment', impact: 'Medium', note: 'Trees far from the street, on steep slopes, behind fences, or in tight backyards may need hand-loading and mulched-in-place techniques.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask for tree height and diameter measurements that determine the price. Compare bids based on the same tree dimensions.',
    'Confirm whether stump grinding, branch chipping, and debris removal are included or priced separately.',
    'Check whether the quote includes liability insurance and workers compensation proof. Never hire a tree service without seeing current certificates.',
    'Ask about the removal method: free-felling, section lowering with ropes, or crane-assisted. Each has different costs and safety profiles.',
  ],
  sections: [
    {
      heading: 'Tree size drives the baseline cost',
      paragraphs: [
        'Tree removal pricing is primarily based on height, trunk diameter, and canopy spread. Small trees under 30 feet tall and 12 inches in diameter can often be felled in one piece, which is fast and cheap. Medium and large trees must be climbed and removed in sections, which adds hours of labor.',
        'Arborists estimate removal time based on how many sections the tree must be cut into for safe lowering. Each section requires a cut, rigging, lowering, and cleanup. Large trees with wide canopies can require 10 or more sections, with each section adding $100 to $300 to the cost.',
        'The crew size also increases with tree size. A small tree may need 1 or 2 people for an hour. A large tree near a house may need a 3 to 5 person crew for half a day or more. Labor is the biggest component of the quote.'
      ]
    },
    {
      heading: 'Proximity to structures significantly increases complexity',
      paragraphs: [
        'A tree in the middle of an open field is the cheapest to remove because the arborist can fell it safely in one direction without risk to anything below. A tree within reach of a house, garage, fence, power line, or driveway requires careful section removal and rigging.',
        'Trees near power lines add another layer of complexity and danger. The utility company may need to de-energize the line or provide a temporary shield. Some arborists will not work within 10 feet of power lines and require the utility provider to handle the clearance first.',
        'Crane-assisted removal is sometimes the safest option for large trees in tight spaces. The crane lifts sections as they are cut, eliminating the risk of swinging loads. Crane rental adds $500 to $2,000 to the removal cost but can reduce overall labor time and increase safety.'
      ]
    },
    {
      heading: 'Stump grinding and site restoration',
      paragraphs: [
        'Leaving the stump is an option if you plan to plant something new in the same spot. But stumps left in place can sprout new growth, attract pests, and become a tripping hazard. Most homeowners choose to grind the stump or have it removed.',
        'Stump grinding uses a rotating cutting disk to chip the stump down to 6 to 12 inches below grade. The resulting wood chips and soil are left as fill. Some arborists include stump grinding in the tree removal price; others charge separately.',
        'Site restoration is often the forgotten cost. Removing a large tree means a hole to fill, roots to deal with, and possibly lawn or landscaping to restore. If the tree was on a slope, soil erosion after removal is a concern. Budget $200 to $500 for fill soil, seed, and restoration work.'
      ]
    },
    {
      heading: 'Emergency tree removal costs more for a reason',
      paragraphs: [
        'Storm damage tree removal carries a premium for several reasons: the tree may be unstable, hanging limbs may fall at any moment, and the crew must work quickly and carefully near damaged structures. Emergency rates are typically 1.5 to 3 times standard rates.',
        'Insurance often covers emergency tree removal if the tree fell on a house, garage, car, or other insured structure. If the tree fell in the yard without hitting anything, removal is usually the homeowner\'s expense. Check your policy before authorizing work.',
        'Many tree services offer 24/7 emergency response. In a major storm, wait times can be long. Have a trusted arborist\'s number saved before you need it. Be wary of storm-chasers who quote high prices for unlicensed or uninsured work.'
      ]
    },
    {
      heading: 'Permits and neighborhood restrictions',
      paragraphs: [
        'Many municipalities require a permit for tree removal, especially for larger trees, trees in protected zones, or trees in historic districts. The permit fee is usually $25 to $100, but fines for removing trees without a permit can be thousands.',
        'Some homeowners associations have tree removal restrictions that go beyond local ordinances. You may need HOA approval in addition to a city permit. Check both before scheduling removal.',
        'Protected species like heritage oaks or native trees may have additional restrictions or require replacement planting. Your arborist should know the local rules, but it is ultimately the homeowner\'s responsibility to ensure compliance.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Does homeowners insurance cover tree removal?',
      answer: 'It covers removal if the tree falls on a covered structure like a house, garage, or fence. It does not cover removal of a tree that falls in the yard without hitting anything.'
    },
    {
      question: 'What is the best time of year for tree removal?',
      answer: 'Late fall through early spring when trees are dormant and the ground is firm. Winter removal is also easier because the lack of leaves reduces debris and allows better visibility.'
    },
    {
      question: 'Should I remove a tree that is too close to my house?',
      answer: 'A tree within 10 feet of a house with large limbs overhanging the roof is a valid concern. An arborist assessment of the tree\'s health and root structure will determine if removal or pruning is the right choice.'
    },
    {
      question: 'Do I need to be home during tree removal?',
      answer: 'Not necessarily, but you should secure pets, move vehicles, and protect fragile items in the work area. Most arborists prefer homeowners to be present to answer questions about site access and restoration.'
    }
  ],
  sources: [
    { label: 'International Society of Arboriculture', url: 'https://www.isa-arbor.com/' },
    { label: 'Tree Care Industry Association', url: 'https://tcia.org/' },
  ],
} as CostGuide;
