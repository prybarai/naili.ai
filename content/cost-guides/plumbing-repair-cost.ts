import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'plumbing-repair-cost',
  title: 'How much does plumbing work cost?',
  description: 'A practical guide to residential plumbing costs, including fixture replacement, water heater install, repiping, drain work, and what to watch for in plumbing estimates.',
  heroImage: '/imagery/cost-guide-plumbing.webp',
  heroAlt: 'Copper water supply pipes and P-trap under a modern bathroom sink.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Plumbing work ranges from the simple and predictable to the invasive and expensive, often depending on how accessible the pipes are and whether the problem is visible on the surface. A leaky faucet can be fixed in an hour. A slab leak under the foundation is a different conversation entirely.',
    'For planning, fixture replacement typically runs a few hundred dollars plus the fixture cost. Water heater installation runs $800 to $2,500. A whole-home repipe can run several thousand dollars, and main sewer line work can be the most expensive plumbing project a homeowner faces.',
  ],
  ranges: getPricingPlanningRanges('plumbing'),
  budgetFactors: [
    { item: 'Accessibility', impact: 'High', note: 'Pipes behind finished walls, in slabs, or in tight crawlspaces cost much more to reach than open-basement or exposed pipe conditions.' },
    { item: 'Pipe material', impact: 'High', note: 'Galvanized steel, polybutylene, or lead supply lines require replacement, not just repair. Copper and PEX cost differently.' },
    { item: 'Permit and code compliance', impact: 'Medium', note: 'Major plumbing work requires permits in most areas. Sewer line work and repiping are almost always permitted.' },
  ],
  quoteChecklist: [
    'Ask whether the quote is a diagnostic fee applied to repair or a separate trip charge.',
    'Confirm whether water heater quotes include delivery, haul-away of old unit, permits, and any needed adapters or expansion tanks.',
    'For repiping projects, verify which walls will be opened and how the finish will be restored.',
    'Request clear language on warranties for both labor and fixtures.',
  ],
  sections: [
    {
      heading: 'Fixture replacement is usually straightforward',
      paragraphs: [
        'Replacing a faucet, toilet, garbage disposal, or shower valve is one of the most common plumbing jobs. The labor is usually predictable when the existing connections are standard and accessible. Complications arise when the old fixture has odd sizing, corroded connections, or non-standard rough-in spacing.',
        'Many homeowners underestimate the cost of the fixture itself versus the labor. A $200 faucet may be installed for $150 to $250, but a special-order faucet with custom trim can push both the fixture and installation cost much higher. It is worth checking whether the plumber charges a flat rate for fixture install or bills hourly.',
        'The budget trap in fixture work is hidden damage behind the wall. When the old valve is removed, the plumber may discover corroded supply stops, bad shutoff valves, or water damage from slow leaks. That can turn a quick fixture swap into a small restoration job.',
      ],
    },
    {
      heading: 'Water heaters: the common mid-range plumbing job',
      paragraphs: [
        'Water heater replacement is one of the most frequent mid-range plumbing projects. Standard tank water heaters typically cost $800 to $1,500 installed for a basic 40-50 gallon model. Tankless units cost more upfront, usually $1,500 to $4,000 installed, but can save on energy over time and take up less space.',
        'Installation cost depends on whether the new unit matches the old location, fuel source, and venting. Switching from electric to gas, replacing a tank with a tankless, or moving the water heater location all increase cost meaningfully. If the current unit is in a tight closet or attic, access adds labor time.',
        'Plumbers should include the shutoff valves, expansion tank (if required by local code), gas line repiping (for gas units), and anode rod in the quote. If those are listed as extras, it is worth knowing upfront rather than at payment time.',
      ],
    },
    {
      heading: 'Repiping: when the whole house needs an update',
      paragraphs: [
        'Whole-home repiping typically becomes necessary when pipes are failing. Galvanized steel pipes rust from the inside, reducing water pressure and eventually leaking. Polybutylene pipes have known failure issues. Copper pipes can eventually develop pinhole leaks, especially in areas with aggressive water chemistry.',
        'Repiping a typical home runs several thousand dollars and involves opening walls and ceilings to run new supply lines. Homeowners often pair repiping with a kitchen or bath remodel so that the wall openings serve both projects.',
        'PEX supply lines have become the standard replacement material in many markets because they are affordable, flexible, and faster to install than copper. Some homeowners still prefer copper for durability. Either way, a detailed scope of which walls will be opened and how patching will be handled is essential for an accurate comparison.',
      ],
    },
    {
      heading: 'Sewer and drain work is the expensive surprise',
      paragraphs: [
        'Main sewer line issues are the most unwelcome plumbing discovery. Tree root intrusion, pipe collapse, bellied lines, or scale buildup can cause backups that require excavation. Trenchless repair methods like pipe bursting or CIPP lining are sometimes options that avoid digging, but they are not always applicable.',
        'A sewer line scope inspection costs a few hundred dollars and is one of the best investments a homeowner can make before buying a house or planning a major renovation. It reveals pipe condition, slope issues, and potential failure points while the ground is still undisturbed.',
        'Drain cleaning for localized clogs is relatively affordable. But if the same drain backs up repeatedly, the underlying problem is usually not grease or hair but a pipe defect. Repeated drain cleaning bills eventually exceed the cost of fixing the root cause.',
      ],
    },
    {
      heading: 'How to read plumbing estimates',
      paragraphs: [
        'Plumbing estimates vary more than many other trades because some plumbers charge by the hour and others quote flat-rate pricing based on the job. Flat-rate quotes are easier to compare but may include a premium for known conditions while excluding hidden issues found after work starts.',
        'Good plumbing estimates include clear language about what happens if the plumber opens up a wall and finds corroded pipes, bad shutoff valves, or code violations that need correction. The scope of "additional work found during repair" should be defined before the job, not after.',
        'Warranties matter in plumbing. Fixture manufacturers offer their own warranties. Plumbers should stand behind their installation labor for at least a year. If a plumber does not warrant their work, that is worth noting even if the price is attractive.',
      ],
    },
  ],
  faqs: [
    { question: 'Can I save money by buying my own fixtures?', answer: 'Sometimes, but if the fixture fails, the plumber will not warranty it. Clarify this before providing your own parts.' },
    { question: 'Why do some plumbers charge a diagnostic fee?', answer: 'Diagnostic fees cover the plumber arriving, assessing the issue, and providing a quote. Many reputable plumbers apply the fee to the repair if you hire them.' },
    { question: 'Is PEX as good as copper?', answer: 'PEX is more affordable, freeze-resistant, and faster to install. Copper is more rigid and rodent-resistant. Both are code-approved.' },
    { question: 'How do I know if I need a repipe?', answer: 'Signs include low water pressure at multiple fixtures, rust-colored water, frequent leaks, or visible corrosion on exposed pipes.' },
  ],
  sources: getPricingPublicSources('plumbing'),
} as CostGuide;
