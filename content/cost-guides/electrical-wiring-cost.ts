import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'electrical-wiring-cost',
  title: 'How much does electrical wiring cost?',
  description: 'A practical breakdown of electrical work costs, including panel upgrades, rewiring, outlet additions, and what to expect when a licensed electrician quotes your project.',
  heroImage: '/imagery/cost-guide-electrical.webp',
  heroAlt: 'Electrical panel with circuit breakers and wiring in a residential home.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Electrical work is one of those categories where the price often surprises homeowners because the visible work outlets and switches is only a small piece of what the electrician is actually doing. The real cost lives in the panel, the wire runs, the load calculations, and the code compliance work that happens behind the walls.',
    'For planning, a basic outlet or switch replacement can be a couple hundred dollars. A panel upgrade typically runs from $1,500 to $4,000, and whole-home rewiring can climb into the many thousands. But most residential electrical projects fall somewhere between a repair and a renovation, and the scope makes all the difference.',
  ],
  ranges: getPricingPlanningRanges('electrical'),
  budgetFactors: [
    { item: 'Panel age and capacity', impact: 'High', note: 'Old fuse panels, undersized 60A service, or obsolete breaker types usually require an upgrade before any significant electrical work.' },
    { item: 'Accessibility and finish', impact: 'High', note: 'Running wire through finished walls, vaulted ceilings, or tight crawlspaces takes much longer than open stud work in new construction.' },
    { item: 'Permit and inspection scope', impact: 'Medium', note: 'Most major electrical work requires permits and final inspection. Smart electricians include this; cheap quotes sometimes skip it.' },
  ],
  quoteChecklist: [
    'Ask about panel make, model, and whether the panel itself is being replaced or just breakers.',
    'Confirm whether the job includes permit pulling and final inspection sign-off.',
    'Clarify how wire runs through finished areas will be handled — surface conduit are cheaper but uglier than fishing wire through walls.',
    'Request a separate line-item for material vs labor so you can compare scope across bids.',
  ],
  sections: [
    {
      heading: 'Panel upgrades are often the starting point',
      paragraphs: [
        'Many older homes were built with 60A or 100A service, which was adequate for the time but can be strained by modern electrical loads. Adding a new kitchen, HVAC system, electric vehicle charger, or home office often pushes past what the original panel can handle.',
        'Upgrading to 200A service is one of the most common residential electrical projects. The electrician replaces the panel, main breaker, and usually the service entrance cable from the meter. If the meter itself needs upgrading, the utility company gets involved, which can add scheduling complexity.',
        'A panel upgrade alone does not rewire the house, but it prepares the electrical system for future work. Many homeowners do the panel first, then tackle room-by-room rewiring as budget allows. That sequential approach is practical as long as the new panel has enough breaker slots for eventual full capacity.',
      ],
    },
    {
      heading: 'Rewiring versus adding circuits',
      paragraphs: [
        'Whole-home rewiring means replacing all the branch circuit wiring from the panel to every outlet, switch, and fixture. It is invasive, expensive, and usually reserved for knob-and-tube replacement, homes with aluminum wiring, or major renovations where the walls are already open.',
        'Adding circuits, by contrast, means running new wire from the panel to specific locations. Kitchen islands, home offices, media rooms, and bathroom upgrades often need new circuits even when the rest of the wiring is fine. This is much less expensive than full rewiring because it targets only the new loads.',
        'The distinction matters because a homeowner who thinks they need full rewiring may only need circuit additions, while someone who assumes their old wiring is fine may be surprised by code requirements when they open walls for a kitchen remodel.',
      ],
    },
    {
      heading: 'The cost of smart home and specialty wiring',
      paragraphs: [
        'Smart home wiring, EV charger circuits, standby generator connections, and home theater wiring have become increasingly common electrical requests. Each one has specific load and code requirements that go beyond what a general contractor might anticipate.',
        'EV charger installation, for example, usually requires a dedicated 240V circuit with a 50A breaker. If the panel is far from the garage or the service needs upgrading first, a seemingly straightforward charger install can snowball. Electricians should quote charger work separately from general electrical so the costs are visible.',
        'Low-voltage wiring for data, security cameras, and audio falls into a separate category from line-voltage electrical work. Some electricians handle it, some do not, and some charge premium rates because it is not their core service. It is worth asking about separately if your project includes smart home infrastructure.',
      ],
    },
    {
      heading: 'Permits, inspections, and doing it right',
      paragraphs: [
        'Most jurisdictions require electrical permits for any work beyond replacing an existing device in kind. Panel swaps, new circuits, and rewiring all trigger permit requirements in the vast majority of US cities. A licensed electrician should handle the permit process as part of the job.',
        'Final inspection matters because electrical problems that hide behind walls are exactly the kind of issue that causes fires years later. A permitted and inspected job gives you documentation that the work meets current code. That matters for insurance, resale disclosure, and peace of mind.',
        'Unpermitted electrical work is one of the most common issues found during home inspections before sale. Even if the work was done well, the lack of permits can become a negotiating point or a required correction that costs more than doing it right the first time.',
      ],
    },
    {
      heading: 'How to compare electrical bids',
      paragraphs: [
        'Electrical bids should separate materials from labor and should specify exactly what is included. A bid that says "rewire the kitchen" is not the same as one that says "run 3 new 20A circuits, install 12 outlets on dedicated kitchen counters, GFCI protect, and wire island". Those details matter.',
        'Ask whether the bid is based on a fixed price for defined scope or time-and-materials. For defined projects like a panel upgrade or a known set of circuits, a fixed price is usually better. For exploratory work or older homes with unknown conditions, some electricians prefer T&M with a not-to-exceed cap.',
        'If one bid is dramatically lower than others, check whether it includes permit fees, panel replacement, or proper wire sizing for the loads described. Sometimes the lowest bid is from someone planning to do less work rather than work more efficiently.',
      ],
    },
  ],
  faqs: [
    { question: 'Do I need to upgrade my panel for minor electrical work?', answer: 'Usually not for single circuit additions, but if your panel has no spare breaker slots or is an obsolete model, the electrician may recommend upgrading before proceeding.' },
    { question: 'Can electrical work be done while living in the home?', answer: 'Yes, but expect intermittent power interruptions. Most residential electrical work is manageable with some coordination around kitchen and bathroom use.' },
    { question: 'Is knob-and-tube wiring dangerous?', answer: 'Old knob-and-tube is brittle, ungrounded, and often buried under insulation. Most insurance companies flag it, and replacement is strongly recommended during renovations.' },
    { question: 'What is the most common hidden electrical issue?', answer: 'Oversized breakers feeding undersized wire is surprisingly common in older homes. It creates a fire risk because the breaker may not trip before the wire overheats.' },
  ],
  sources: getPricingPublicSources('electrical'),
} as CostGuide;
