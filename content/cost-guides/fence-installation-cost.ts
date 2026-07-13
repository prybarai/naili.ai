import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'fence-installation-cost',
  title: 'How much does fence installation cost?',
  description: 'A practical breakdown of fence installation costs by material type, yard size, gate count, terrain, and the site conditions that change price more than homeowners expect.',
  heroImage: '',
  heroAlt: 'Clean horizontal wood privacy fence along a residential property line.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Fence pricing feels simple until you get a few quotes and they are thousands apart for what sounds like the same thing. The reason is that fence cost is driven by more than just the material on top. Post depth, gate count, terrain, linear footage vs. square footage all work together to shift the number.',
    'For planning purposes, a basic chain link or pressure-treated wood fence on a typical lot usually runs $1,500 to $4,000. A privacy fence in wood or vinyl typically lands between $3,000 and $8,000 depending on height, gate count, and lot size. Premium materials like wrought iron, aluminum, or hog wire with custom gates start at $8,000 and climb fast on longer runs.',
    'The biggest fence budgeting mistake homeowners make is treating the whole yard as one big rectangle. In real yards, corners, slopes, trees, buried utilities, and gates create more cost than the material alone. A 150-foot straight run is cheaper per foot than a 150-foot run with two gates, a tree root zone, and a slope change in the middle.'
  ],
  ranges: getPricingPlanningRanges('fencing'),
  budgetFactors: [
    { item: 'Material type', impact: 'High', note: 'Chain link is the most affordable, then pressure-treated wood, then vinyl, then aluminum or wrought iron. Each material has different post and hardware requirements.' },
    { item: 'Linear footage and gate count', impact: 'High', note: 'Longer runs cost more, but gates add disproportionate cost because they require posts, hinges, latches, and often concrete footings for support.' },
    { item: 'Terrain and site conditions', impact: 'Medium', note: 'Sloped lots, rocky soil, tree roots, and buried utilities all increase labor time and may require specialized fence designs or stepped sections.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the quote includes post holes to frost depth with concrete footings, not just tamped earth or gravel.',
    'Check if gate hardware, latches, hinges, and any automatic gate provisions are included or priced separately.',
    'Ask how slopes and grade changes are handled — stepped panels or racked (following the slope) fencing affects both cost and appearance.',
    'Verify the property line location — responsible contractors require a survey or property stakeout so the fence goes on the right side of the line.',
  ],
  sections: [
    {
      heading: 'Wood remains the most common choice for good reason',
      paragraphs: [
        'Pressure-treated pine is the workhorse of residential fencing. It is affordable, readily available, and can be stained or painted to match the house. A standard 6-foot privacy fence in wood typically costs $20 to $40 per linear foot installed, depending on post spacing, gate count, and terrain complexity.',
        'Cedar and redwood are premium wood options that resist rot naturally without chemical treatment. They cost more upfront — typically $30 to $50 per linear foot installed — but age gracefully with proper sealing and can last significantly longer than treated pine in wet climates.',
        'The downside of wood fencing is maintenance. Staining or sealing every two to four years is necessary in most climates. Skipping that maintenance leads to warping, cracking, and eventual replacement. If you want a set-it-and-forget-it fence, vinyl or metal may be a better long-term choice.'
      ]
    },
    {
      heading: 'Vinyl fencing costs more upfront but requires almost no maintenance',
      paragraphs: [
        'Vinyl privacy fencing typically runs $30 to $50 per linear foot installed. The material cost is higher than wood, but the appeal is clear: no painting, no staining, no rot, and no insect damage. A quality vinyl fence from a reputable manufacturer can last 20-30 years with nothing more than occasional washing.',
        'Not all vinyl fencing is the same. Thin, hollow-profile fences are more prone to cracking in cold weather and yellowing in strong sun. Better-quality vinyl fences use thicker material, UV stabilizers, and internal bracing. Pay attention to the wall thickness and warranty — a cheap vinyl fence is not always a bargain.',
        'Installation of vinyl fencing requires more care than wood because the panels cannot be cut and adjusted on site the way wood can. Precise post placement and alignment are critical. Once set, vinyl panels either fit or they do not, so installer experience matters.'
      ]
    },
    {
      heading: 'Chain link, aluminum, and decorative metal options',
      paragraphs: [
        'Chain link fencing is the most budget-friendly option, typically running $15 to $30 per linear foot installed. It serves well for utility purposes like containing pets, defining property lines, or securing backyards. Galvanized chain link lasts longer than vinyl-coated, but vinyl-coated is more visually appealing.',
        'Aluminum fencing is a popular alternative for homeowners who want the look of wrought iron without the weight and rust risk. Aluminum is lightweight, durable, and resists corrosion. Pricing typically runs $25 to $50 per linear foot installed, depending on height, style, and gate complexity.',
        'Wrought iron fencing is the premium option for decorative perimeter fencing. It is heavy, requires welding and custom fabrication, and needs periodic painting to prevent rust. A custom wrought iron fence with ornamental details can easily exceed $50 per linear foot. For most homeowners, aluminum offers a comparable look at a lower cost.'
      ]
    },
    {
      heading: 'Gates, slopes, and site access are quiet cost drivers',
      paragraphs: [
        'Gates are where fence budgets often surprise homeowners. A single walk gate is modest. A double driveway gate with posts, hinges, latches, and concrete footings can add $500 to $2,000 or more depending on width and materials. If you want automatic gate openers, budget an additional $800 to $2,500 plus electrical work.',
        'Slopes add cost because fences must either step down (creating gaps at the bottom) or rack (follow the slope) for a continuous look. Racked fencing requires custom fabrication, especially in vinyl and metal, and costs more per foot. Stepped fencing is cheaper but leaves noticeable triangular gaps.',
        'Site access and soil conditions also matter. If the fence crew has to carry materials through the house because there is no yard access, labor time goes up. Rocky soil, heavy clay, buried tree roots, or frost-depth requirements in northern climates all increase the time and equipment needed for post holes.'
      ]
    },
    {
      heading: 'How to compare fence quotes fairly',
      paragraphs: [
        'Ask each contractor to quote the same linear footage, height, post spacing, gate count and width, material grade, and finish level. A quote based on 140 feet of fencing with one walk gate is not comparable to a quote based on 150 feet with a driveway gate. Get the exact identical scope priced.',
        'Check whether the quote includes concrete footings to frost depth, any necessary property survey work, demo and disposal of an existing fence, and cleanup afterward. Also verify the warranty on both materials and workmanship — many fence manufacturers require professional installation for warranty validity.',
        'Get a custom estimate for your specific yard, upload a photo and we will build the brief. Naili helps you describe the lot shape, desired material, gate needs, and terrain conditions so every fence contractor can start from a clearer scope description.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Do I need a survey before installing a fence?',
      answer: 'Yes. Building a fence a few inches over the property line can lead to disputes, removal orders, and legal costs. A survey is cheap insurance.'
    },
    {
      question: 'How deep should fence posts be set?',
      answer: 'Below the frost line, typically 24 to 48 inches depending on your climate. Shallow posts heave in freezing weather and the fence tilts within a year or two.'
    },
    {
      question: 'Whats better: wood or vinyl fence?',
      answer: 'Wood is cheaper upfront and easier to repair. Vinyl is more expensive initially but requires almost no maintenance. Choose based on your tolerance for ongoing upkeep.'
    },
    {
      question: 'Do I need a permit to build a fence?',
      answer: 'Most municipalities require a permit for fences over a certain height (typically 4-6 feet). Check local rules before ordering materials or starting work.'
    }
  ],
  sources: getPricingPublicSources('fencing'),
} as CostGuide;
