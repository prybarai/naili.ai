import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'concrete-work-cost',
  title: 'How much does concrete work cost?',
  description: 'A practical breakdown of concrete work costs for slabs, walkways, patios, stamped concrete, retaining walls, and other residential concrete projects.',
  heroImage: '',
  heroAlt: 'Newly poured concrete patio with decorative broom finish and wood deck extension.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Concrete work costs vary widely based on project type, thickness, finish, reinforcement, and site accessibility. Simple concrete slabs for a shed or garage floor are the most affordable, while stamped or colored concrete patios and driveways command a premium.',
    'Standard concrete slabs typically run $6 to $10 per square foot for basic 4-inch slabs with wire mesh reinforcement. Stamped concrete adds $4 to $8 per square foot for the pattern and color. Retaining walls are priced per square foot of wall face.',
    'The cost of concrete is relatively predictable per yard, but the labor and site prep can vary enormously. Excavation, forming, grading, and finishing account for the majority of the project cost, not the concrete itself.'
  ],
  ranges: [
    { label: 'Standard concrete slab (4-inch)', range: '$6 to $10 per sq ft', note: 'Basic slab for shed, patio, walkway, or driveway apron. Includes wire mesh and standard broom finish.' },
    { label: 'Stamped or decorative concrete', range: '$12 to $20 per sq ft', note: 'Pattern-stamped, colored, or stained concrete. Ideal for patios, walkways, and pool decks.' },
    { label: 'Concrete walkway or path', range: '$8 to $15 per sq ft', note: '4-inch thick, formed, with control joints. Curves and steps add cost compared to straight runs.' },
    { label: 'Concrete retaining wall (per sq ft of facing)', range: '$25 to $50 per sq ft', note: 'Reinforced concrete, rebar, and proper drainage. Taller walls need structural engineering.' },
    { label: 'Concrete driveway apron or approach', range: '$10 to $18 per sq ft', note: '6-inch thick, reinforced, with thickened edges. Must handle vehicle loads at curb transition.' },
  ],
  budgetFactors: [
    { item: 'Site access and ground prep', impact: 'High', note: 'Removing grass, excavating, grading, and compacting the subgrade add significant labor. Hard-to-reach sites cost more.' },
    { item: 'Reinforcement and thickness', impact: 'High', note: 'Wire mesh, rebar, fiber mesh, and thicker slabs all add material cost but prevent cracking and extend lifespan.' },
    { item: 'Finish complexity', impact: 'Medium', note: 'Broom finish is standard and cheapest. Exposed aggregate, stamped, stained, and polished finishes add craftsmanship time.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm slab thickness (4-inch standard, 6-inch for vehicles) and reinforcement method (wire mesh, rebar, or fiber mesh).',
    'Ask about control joint placement. Joints should be placed every 10-15 feet of slab length to control cracking.',
    'Clarify whether excavation, grading, compaction, and disposal of removed material are included in the quote.',
    'Check the concrete mix specification (standard 4,000 PSI is typical for residential slabs) and whether it includes air-entrainment for freeze-thaw climates.',
  ],
  sections: [
    {
      heading: 'Slab thickness and reinforcement matter for longevity',
      paragraphs: [
        'The standard residential concrete slab is 4 inches thick with 6x6 wire mesh reinforcement. This is adequate for patios, walkways, and floor slabs under normal residential use. Driveways, garage floors, and areas that support vehicles need 5 to 6 inches of concrete.',
        'Reinforcement distributes the load and controls cracking. Wire mesh is the most common and cost-effective reinforcement for residential slabs. Rebar is used for structural applications like retaining walls, footings, and heavily loaded slabs. Fiber mesh is added to the mix to reduce plastic shrinkage cracking.',
        'Concrete strength is measured in PSI pounds per square inch. Residential slabs typically use 3,000 to 4,000 PSI mix. Higher PSI concrete costs more but provides greater durability for heavy loads or extreme freeze-thaw exposure.'
      ]
    },
    {
      heading: 'Site preparation determines the quality of the finished product',
      paragraphs: [
        'Proper site prep involves removing vegetation, excavating to the required depth, grading for drainage, and compacting the subgrade. A poorly prepared base causes slabs to settle, crack, and heave over time, regardless of the concrete quality.',
        'In cold climates, a 4 to 6 inch base of compacted gravel beneath the slab provides drainage and prevents frost heave. The gravel base also provides a stable working surface for the concrete pour and prevents the slab from wicking moisture from the soil.',
        'Good drainage around the slab is critical. The finished concrete surface should slope away from structures at 1/4 inch per foot minimum to prevent water pooling. Standing water on concrete leads to staining, surface deterioration, and freeze-thaw damage.'
      ]
    },
    {
      heading: 'Stamped concrete offers decorative appeal at a reasonable cost',
      paragraphs: [
        'Stamped concrete involves pressing patterns and textures into freshly poured concrete to mimic stone, brick, slate, or tile. Combined with color hardeners and release agents, it creates a premium look for less than natural stone or pavers.',
        'The cost premium for stamping is $4 to $8 per square foot over standard concrete. Complex patterns, multiple colors, and borders add to that cost. The pattern and color choices are virtually unlimited, and modern sealers protect the surface beautifully.',
        'Stamped concrete requires sealing every 2 to 3 years to maintain its color and protect against UV fading. If the sealer wears off, the concrete can look faded and chalky. Resealing is a relatively simple DIY task or costs $300 to $600 for a typical patio.'
      ]
    },
    {
      heading: 'Concrete retaining walls need structural design for height',
      paragraphs: [
        'Short retaining walls under 3 feet can use standard poured concrete or concrete block on a compacted base. Taller walls require structural engineering, reinforced footings, drainage aggregate, and weep holes at the base to relieve hydrostatic pressure.',
        'The cost of a concrete retaining wall depends on height, length, whether it uses poured concrete or segmental retaining wall blocks, and the complexity of the backfill and drainage system. Concrete block walls are usually more affordable than poured concrete for decorative applications.',
        'Proper drainage behind a retaining wall is critical. Without drainage aggregate and drainpipe, water pressure builds up behind the wall and eventually pushes it over. The drainage system is a small part of the total cost but is essential for the wall\'s long-term stability.'
      ]
    },
    {
      heading: 'Timing and weather affect concrete work',
      paragraphs: [
        'Concrete cures through a chemical reaction that requires the right temperature range. Ideal pouring temperatures are between 50°F and 85°F. Concrete poured in extreme heat sets too fast and cracks. Concrete poured in cold weather may freeze before it cures, compromising strength.',
        'Most concrete contractors are busiest in spring and fall, the optimal seasons in most climates. Scheduling in summer or winter may be easier to book but carries weather risks. Some contractors charge a premium for cold-weather pouring because it requires additives and curing blankets.',
        'Curing time is another factor. Concrete reaches 70% of its strength in 7 days and full strength in 28 days. During that time, the slab should not be subjected to heavy loads. Planning for the curing period is important for driveways and accessible areas.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Can concrete be poured in cold weather?',
      answer: 'Yes, with precautions. Concrete can be poured down to 20°F using hot water, accelerators, and insulating blankets. Most contractors charge a premium for cold-weather pours.'
    },
    {
      question: 'Should I seal my concrete patio or driveway?',
      answer: 'Sealing is recommended for stamped or colored concrete to protect the finish. Standard broom-finish concrete does not require sealant but benefits from it in freeze-thaw climates.'
    },
    {
      question: 'How do I prevent concrete from cracking?',
      answer: 'Proper base prep, reinforcement, control joints, and proper curing are the four pillars of crack prevention. Not all cracks can be prevented, but they can be controlled.'
    },
    {
      question: 'How long does concrete take to fully cure?',
      answer: 'Concrete reaches 70% strength in 7 days and full design strength in 28 days. Light foot traffic is fine after 24-48 hours, but vehicle loads should wait at least 7 days.'
    }
  ],
  sources: [
    { label: 'American Concrete Institute', url: 'https://www.concrete.org/' },
    { label: 'Portland Cement Association', url: 'https://www.cement.org/' },
  ],
} as CostGuide;
