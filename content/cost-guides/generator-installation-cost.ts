import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'generator-installation-cost',
  title: 'How much does generator installation cost?',
  description: 'A practical breakdown of generator installation costs for portable, standby, natural gas, propane, and whole-home backup generators with transfer switches.',
  heroImage: '',
  heroAlt: 'Whole-home standby natural gas generator installed on a concrete pad with weatherproof enclosure.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Generator installation costs span a wide range depending on whether you need a portable unit for a few critical circuits or a whole-home standby generator that powers everything automatically. The generator itself is only part of the cost the transfer switch, electrical work, fuel line, and concrete pad add up significantly.',
    'A portable generator with a manual transfer switch costs $600 to $2,500 total. A whole-home standby generator with automatic transfer switch and professional installation runs $5,000 to $15,000 or more, depending on the size and fuel type.',
    'Fuel choice matters for ongoing costs. Natural gas generators have lower operating costs but require connection to the gas line. Propane generators are easier to install on sites without gas but require tank refills. Diesel is less common for residential use but offers fuel stability for long-duration outages.'
  ],
  ranges: [
    { label: 'Portable generator with manual transfer', range: '$600 to $2,500', note: '5-10 kW portable generator, manual transfer switch, inlet box, and basic electrical work. Owner provides fuel.' },
    { label: 'Standby generator 12-14 kW (natural gas)', range: '$5,000 to $10,000', note: 'Automatic standby unit covering essential circuits. Includes concrete pad, transfer switch, gas line, and electrical.' },
    { label: 'Standby generator 16-22 kW (whole home)', range: '$8,000 to $15,000+', note: 'Larger unit covering most or all of the home. Requires larger gas line, bigger panel, and more extensive electrical work.' },
    { label: 'Automatic transfer switch (standalone)', range: '$600 to $1,500', note: 'Installed when adding generator to existing electrical panel. Price varies by amperage and circuit count.' },
  ],
  budgetFactors: [
    { item: 'Generator size and fuel type', impact: 'High', note: 'kW rating determines what the generator can power. Natural gas requires gas line hookup. Propane needs a tank. Diesel needs fuel storage.' },
    { item: 'Transfer switch complexity', impact: 'High', note: 'Service-rated transfer switches for whole-home coverage cost more and require larger capacity panels. Critical-circuit switches are cheaper but limited.' },
    { item: 'Site preparation and installation', impact: 'Medium', note: 'Concrete pad, electrical trenching, gas line installation, and permits all add cost. Accessibility and distance from gas meter matter.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Verify the generator size in kW and which circuits or appliances it will power. A whole-home claim should specify the exact load calculation.',
    'Confirm whether the quote includes the concrete pad, gas line installation, electrical connections, and the automatic transfer switch.',
    'Ask about noise levels (dB rating). Standby generators produce 60-75 dB at full load. Sound-attenuated enclosures cost more but reduce noise.',
    'Check warranty terms: generator engine, alternator, and labor should all have separate warranty periods. Transfer switch warranties are typically separate.',
  ],
  sections: [
    {
      heading: 'Generator sizing determines what you can power',
      paragraphs: [
        'Generator output is measured in kilowatts (kW) and determines how many appliances, lights, and systems can run simultaneously. A 5 to 7 kW generator covers essential circuits: refrigerator, lights, sump pump, furnace fan, and a few outlets. A 12 to 14 kW unit adds well pump, microwave, window AC, and more lights. A 20+ kW whole-home unit powers everything including central AC, electric oven, and electric dryer.',
        'Sizing is done through a load calculation that adds up the wattage of every appliance and device you want to power. Your contractor should perform this calculation to determine the right generator size. Oversizing adds unnecessary cost. Undersizing risks tripping the generator under load.',
        'For portable generators, prioritize the essential circuits and use extension cords or a manual transfer switch. For standby generators, decide whether you need whole-home coverage or critical circuits only. The difference in generator size can be 10 to 20 kW less, saving thousands.'
      ]
    },
    {
      heading: 'Fuel choices affect installation and operating costs',
      paragraphs: [
        'Natural gas is the most popular fuel for standby generators because it connects directly to the existing gas line, provides unlimited runtime during outages, and has the lowest fuel cost. The installation requires a dedicated gas line from the meter to the generator, which costs $500 to $2,000 depending on distance.',
        'Propane generators are a good choice when natural gas is not available. They run cleaner than gasoline and store well. A 500-gallon propane tank costs $1,500 to $3,000 installed and provides 2 to 5 days of continuous runtime depending on generator size and load.',
        'Diesel generators are less common for residential use but offer excellent fuel stability and long engine life. They cost more upfront and have higher fuel costs but can run for days or weeks without refueling if properly stored. Noise and emissions are higher than natural gas or propane.'
      ]
    },
    {
      heading: 'Transfer switches are the critical safety component',
      paragraphs: [
        'A transfer switch prevents backfeeding, where electricity from the generator flows back into the utility grid and endangers line workers. It also isolates the generator circuit from the utility circuit so they cannot be energized simultaneously. This is both a safety requirement and a code requirement.',
        'Manual transfer switches require you to turn them on when the power goes out and off when utility power returns. They cost $300 to $800 installed. Automatic transfer switches detect utility power loss, start the generator, and transfer the load automatically. They cost $600 to $1,500 installed.',
        'Service-rated transfer switches handle the full electrical capacity of the panel and are required for whole-home generators. Critical-circuit switches are smaller and only power the circuits you designate. The choice between them depends on whether you want whole-home backup or essential circuits only.'
      ]
    },
    {
      heading: 'Permits, inspections, and electrical codes',
      paragraphs: [
        'Generator installation requires electrical permits and sometimes building and gas permits as well. Your contractor should handle the permit applications, which cost $100 to $500 depending on local fees. The installation must be inspected by the local building department.',
        'Code requirements include proper clearances from windows, doors, and property lines (typically 5 feet from openings), elevation above flood level, and proper wiring methods for the transfer switch and fuel line. Most standby generators must sit on a concrete pad or certified mounting base.',
        'The National Electrical Code (NEC) has specific requirements for generator installations including the transfer switch type, grounding, conductor sizing, and load management. Working with a licensed electrical contractor who knows the local code adoption is essential.'
      ]
    },
    {
      heading: 'Maintenance and ongoing costs',
      paragraphs: [
        'Standby generators require annual maintenance: oil change, filter replacement, spark plugs, battery check, and valve adjustment on some models. Annual service costs $200 to $500. Many contractors offer maintenance plans that include automatic exercise cycle testing.',
        'Generators need to run periodically to keep the engine lubricated and the battery charged. Most standby generators have built-in exercise timers that run the unit for 15 to 30 minutes weekly. This consumes a small amount of fuel but is essential for reliability.',
        'Batteries in standby generators last 3 to 5 years and cost $100 to $300 to replace. Propane in storage tanks should be topped off after extended use. Natural gas has no refueling concerns. Plan for these recurring costs in your ownership budget.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Can I install a generator myself?',
      answer: 'Portable generators with plug-in cords and manual switches are DIY-friendly if you are experienced with electrical work. Standby generators require professional installation for gas, electrical, and permit compliance.'
    },
    {
      question: 'How loud is a standby generator?',
      answer: 'Most residential standby generators produce 60 to 75 dB at full load, comparable to a vacuum cleaner or normal conversation. Sound-attenuated enclosures reduce noise by 5 to 10 dB.'
    },
    {
      question: 'How long does generator installation take?',
      answer: 'Portable generator setup: 1-2 days. Standby generator installation: 2-5 days including pad, gas line, electrical, and commissioning. Permits add lead time.'
    },
    {
      question: 'Do I need a permit for a standby generator?',
      answer: 'Yes. Electrical permits are required for the transfer switch and connections. Gas permits may be required for the gas line. Building permits apply to the concrete pad in some areas.'
    }
  ],
  sources: [
    { label: 'National Electrical Code (NEC) Generator Installation Standards', url: 'https://www.nfpa.org/' },
    { label: 'Generac Home Generator Sizing Guide', url: 'https://www.generac.com/' },
  ],
} as CostGuide;
