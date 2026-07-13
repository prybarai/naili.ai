import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'solar-panel-installation-cost',
  title: 'How much does solar panel installation cost?',
  description: 'A practical breakdown of solar panel installation costs by system size, panel type, battery backup, and what to expect from federal tax credits and local incentives.',
  heroImage: '',
  heroAlt: 'Residential solar panel array installed on a south-facing roof with blue sky background.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Solar panel installation costs have dropped dramatically over the past decade, but the upfront price still ranges from $15,000 to $35,000 for a typical residential system before incentives. After the federal tax credit, that net cost drops to roughly $10,500 to $24,500.',
    'The cost per watt is the standard measure for comparing solar quotes. Most residential systems fall between $2.50 and $3.75 per watt before incentives, with the total system size measured in kilowatts DC. A typical home needs a 6 to 12 kW system.',
    'Battery storage, premium panels, microinverters, and complex roof geometry all push the price higher. The question is not just what the system costs, but how much it saves you over its 25-year lifespan.'
  ],
  ranges: [
    { label: 'Small roof-mount system (4-6 kW)', range: '$12,000 to $18,000', note: 'Suitable for smaller homes with modest energy use. Covers partial electric load. Includes standard panels and string inverter.' },
    { label: 'Mid-size roof-mount system (6-10 kW)', range: '$18,000 to $28,000', note: 'Most common residential system size. Covers typical home electric load. Supports microinverters or optimizer upgrade.' },
    { label: 'Large system with battery backup (10-15 kW)', range: '$28,000 to $45,000+', note: 'Whole-home solar with battery storage, premium panels, and full monitoring. Max coverage and grid independence.' },
    { label: 'Ground-mount system (any size)', range: '$20,000 to $40,000', note: 'Higher installation cost than roof mount due to trenching, racking, and permitting. Useful when roof orientation or shading is poor.' },
  ],
  budgetFactors: [
    { item: 'Roof type, angle, and orientation', impact: 'High', note: 'Complex rooflines, steep pitches, slate or tile roofs, and shading all add labor and may require panel layout compromises.' },
    { item: 'Solar equipment quality', impact: 'High', note: 'Panel efficiency, inverter type (string vs microinverter), and battery chemistry vary widely in cost and long-term performance.' },
    { item: 'Federal and local incentives', impact: 'Medium', note: 'The 30% federal tax credit applies to system cost. State rebates, SRECs, and net metering policies also impact net cost.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Compare cost per watt (total system cost / system size in watts) across all bids. This is the most apples-to-apples metric.',
    'Confirm panel brand, wattage, inverter type, and whether the quote includes all permits, interconnection, and monitoring.',
    'Ask about production guarantees. Some installers guarantee annual kWh production; others only warrant the equipment.',
    'Check battery backup scope carefully if you are considering storage. Not all inverters are battery-ready, and adding storage later is more expensive.',
  ],
  sections: [
    {
      heading: 'System size is the primary cost driver',
      paragraphs: [
        'The size of your solar system in kilowatts is determined by your annual electricity consumption, roof space, and budget. A 6 kW system is typical for a smaller home with moderate usage, while 10 to 12 kW systems cover larger homes with higher consumption.',
        'Cost per watt decreases as system size increases because fixed costs like permitting, design, and installation labor are spread across more panels. A 4 kW system might cost $3.50 per watt, while a 10 kW system might cost $2.75 per watt from the same installer.',
        'Your installer should review at least 12 months of utility bills to size the system appropriately. Oversizing adds upfront cost, but undersizing leaves savings on the table. Most homeowners aim for 80% to 110% of annual usage.'
      ]
    },
    {
      heading: 'Inverter choice affects system performance and cost',
      paragraphs: [
        'String inverters are the most affordable and work well when panels face the same direction with minimal shading. They cost $1,000 to $2,000 for a typical system but suffer from the weakest panel dragging down the whole string.',
        'Microinverters or power optimizers allow each panel to perform independently, which is ideal for roofs with partial shading, different orientations, or complex layouts. They cost $200 to $300 more per panel but often prove worthwhile in real-world conditions.',
        'Battery-ready inverters or hybrid inverters are needed if you plan to add battery storage now or in the future. A standard string inverter cannot manage battery charging and discharging, so if you think you might add storage later, choose a compatible inverter now.'
      ]
    },
    {
      heading: 'Battery backup adds significant cost but provides energy independence',
      paragraphs: [
        'Adding battery storage to a solar system adds $8,000 to $15,000 or more depending on capacity and brand. The Tesla Powerwall, Enphase IQ Battery, and Generac PWRcell are common options with usable capacities ranging from 10 to 20 kWh.',
        'Batteries provide backup power during grid outages and allow time-of-use optimization, storing solar energy produced during the day for use during peak evening rates. Without a battery, grid-tied solar systems shut down during blackouts for safety reasons.',
        'The payback period for battery storage is longer than for solar panels alone, typically 7 to 15 years versus 5 to 10 years for solar. But if you face frequent outages or have time-of-use rates with wide peak spreads, the value proposition gets better.'
      ]
    },
    {
      heading: 'Federal tax credits dramatically reduce net cost',
      paragraphs: [
        'The federal Investment Tax Credit (ITC) allows you to deduct 30% of the total solar system cost from your federal income taxes. This applies to panels, inverters, battery storage, racking, wiring, labor, and permitting. There is no cap on the credit amount.',
        'To claim the credit, you need sufficient tax liability in the year of installation. The credit is non-refundable meaning it cannot exceed the tax you owe but unused portions can be rolled forward to future tax years.',
        'State and local incentives vary widely. Some states offer additional rebates, performance-based incentives, or Solar Renewable Energy Credits (SRECs) that can reduce net system cost by thousands more. Check the Database of State Incentives for Renewables (DSIRE) for your area.'
      ]
    },
    {
      heading: 'Roof condition and mounting matter for long-term reliability',
      paragraphs: [
        'Solar panels last 25 to 30 years, so the roof beneath them must be in good condition. If your roof is nearing the end of its life, replacing it before the solar installation saves the future cost of removing and reinstalling panels.',
        'Roof-mounted systems use penetrating mounts that seal with flashing to prevent leaks. Composition shingle roofs are the easiest for solar mounting. Tile roofs, slate, and metal roofs require specialized mounting systems that add to the cost.',
        'Ground-mount systems are a good alternative when roof orientation, shading, or condition are problematic. They cost 10% to 20% more due to trenching for underground conduit, foundation work, and the racking structure but allow optimal panel angle and easier maintenance access.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How long do solar panels last?',
      answer: 'Most solar panels carry a 25-year performance warranty and continue producing power beyond that at a gradually reduced output. Inverters typically need replacement after 10 to 15 years.'
    },
    {
      question: 'Do I need to replace my roof before installing solar?',
      answer: 'If your roof has less than 10-15 years of life remaining, replacing it before solar installation is usually recommended to avoid the cost of de-installing and reinstalling panels later.'
    },
    {
      question: 'Can I go completely off-grid with solar and batteries?',
      answer: 'Technically yes, but it requires a very large system and battery bank, making it significantly more expensive than staying grid-tied. Most homeowners choose grid-tied with battery backup for outages.'
    },
    {
      question: 'How much does solar save on electricity bills?',
      answer: 'Most homeowners save $600 to $2,000 per year depending on local electricity rates, system size, and sun exposure. Typical payback periods are 5 to 10 years before incentives.'
    }
  ],
  sources: [
    { label: 'U.S. Department of Energy Solar Energy Technologies Office', url: 'https://www.energy.gov/eere/solar' },
    { label: 'DSIRE Database of State Incentives for Renewables', url: 'https://www.dsireusa.org/' },
  ],
} as CostGuide;
