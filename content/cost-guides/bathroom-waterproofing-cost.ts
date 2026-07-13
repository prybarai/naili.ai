import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'bathroom-waterproofing-cost',
  title: 'How much does bathroom waterproofing cost?',
  description: 'A practical breakdown of bathroom waterproofing costs for shower pans, tile membranes, RedGard, Schluter systems, and vapor barriers for new and remodelled bathrooms.',
  heroImage: '',
  heroAlt: 'Bathroom shower pan waterproofing with liquid membrane applied to cement board before tile installation.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Bathroom waterproofing is not optional it is the most important step in any tile installation. A failed shower pan or poorly sealed wall membrane can cause water damage, mold, and structural rot that costs tens of thousands to repair. The waterproofing itself costs a fraction of what you would pay for the damage it prevents.',
    'Shower pan waterproofing typically runs $500 to $2,500 depending on the system chosen. Schluter Kerdi or membrane systems cost more in materials but are faster to install. Liquid-applied membranes like RedGard are more affordable but demand careful application.',
    'Full bathroom waterproofing for a standard tub-shower combo runs $800 to $2,000 for materials and labor, while a custom walk-in shower with multiple wall membranes and niches adds $1,500 to $4,000 or more.'
  ],
  ranges: [
    { label: 'Shower pan liner (PVC or CPE)', range: '$400 to $1,200', note: 'Traditional pre-slope, liner, and final mud bed. Proven system, requires experienced installer.' },
    { label: 'Liquid-applied membrane (RedGard, Hydro Ban)', range: '$500 to $1,500', note: 'Roll-on waterproofing applied to cement board. Labor-intensive but affordable materials.' },
    { label: 'Sheet membrane system (Schluter Kerdi, Wedi)', range: '$800 to $2,500', note: 'Foam board or fabric membrane system. Faster install, premium materials, excellent warranty.' },
    { label: 'Full shower and wall waterproofing', range: '$1,500 to $4,000', note: 'Complete system covering pan, walls, niches, curb, and bench. Includes all materials and labor.' },
  ],
  budgetFactors: [
    { item: 'Waterproofing system type', impact: 'High', note: 'Liquid membrane is cheapest in materials but takes more labor. Sheet membranes cost more in materials but install faster with less skill risk.' },
    { item: 'Shower size and complexity', impact: 'High', note: 'Curved walls, multiple niches, benches, steam showers, and curbless designs all add waterproofing complexity and cost.' },
    { item: 'Substrate preparation', impact: 'Medium', note: 'Poorly prepared walls or floors require additional leveling, patching, or reinforcement before waterproofing can begin.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask which waterproofing system is specified (liquid, sheet, or traditional liner) and confirm the system is compatible with the tile and substrate.',
    'Confirm that the waterproofing extends up the walls at least to the shower head height (typically 6 feet or to the ceiling for steam showers).',
    'Check whether niches, curbs, benches, and corners are fully waterproofed and seams are treated with manufacturer-recommended sealant and fabric.',
    'Ask about flood testing: the contractor should fill the shower pan with water for 24-48 hours to confirm zero leakage before tile goes in.',
  ],
  sections: [
    {
      heading: 'Liquid-applied membranes are versatile but demanding',
      paragraphs: [
        'Liquid-applied waterproofing membranes like RedGard, Hydro Ban, and Aquadefense are paintable or rollable compounds that form a seamless rubber-like barrier when cured. They work over cement board, drywall, and exterior-grade plywood, conforming to complex shapes and tight corners.',
        'The biggest advantage of liquid membranes is the seamless application. No seams means no potential failure points, which is why many tile pros prefer them for custom showers with benches, niches, and multiple wall angles. The material cost is relatively low at $50 to $100 per gallon.',
        'The challenge is proper application. Liquid membranes need two to three coats at specific thicknesses with adequate drying time between each coat. If the membrane is applied too thin, it will fail. Many contractor errors come from rushing the drying process or skimping on coat thickness.'
      ]
    },
    {
      heading: 'Sheet membrane systems offer reliability and speed',
      paragraphs: [
        'Schluter Kerdi is the most widely used sheet membrane system, consisting of polyethylene fabric sheets bonded with thin-set mortar to create a continuous waterproof barrier. The Wedi system uses extruded polystyrene foam board with a factory-bonded waterproof membrane.',
        'Sheet membrane systems are engineered to be foolproof when installed correctly. The manufacturer provides detailed instructions for seams, corners, pipes, and niches. Schluter allows foam curb and niche components that integrate seamlessly with the membrane.',
        'The material cost is higher than liquid membranes, but the installation is faster and less dependent on the installer\'s technique. A Kerdi shower installation can be completed in one day of waterproofing work, whereas liquid membranes require multiple drying periods across multiple days.'
      ]
    },
    {
      heading: 'Traditional shower pan liners are proven but dated',
      paragraphs: [
        'The traditional shower pan system uses a PVC or CPE liner installed over a pre-sloped mortar bed, with a second mortar bed poured on top of the liner. The liner is lapped up the walls at least 6 inches above the curb height and clamped at the drain.',
        'This system has been used successfully for decades and is still common in many markets. It is less expensive in materials but requires a skilled installer to get the pre-slope, weep holes, and drain connection right. A failed traditional pan is difficult to repair without removing all the tile.',
        'Most modern waterproofing codes have moved away from traditional liners in favor of bonded membranes because the traditional system relies on gravity to direct water to the drain, while bonded membranes create a truly waterproof enclosure.'
      ]
    },
    {
      heading: 'Wall waterproofing is just as important as the pan',
      paragraphs: [
        'The walls of a shower must be waterproofed from the shower pan up to the shower head height or higher. Water splashes and runs down walls, and if it penetrates the grout or tile, it will reach the substrate. Without a waterproof membrane behind the tile, moisture will accumulate and cause damage.',
        'For tub surrounds, waterproofing must extend above the tub spout height with a flange that overlaps the tub lip. The critical area is the seam between the wall waterproofing and the tub or shower pan. This transition must be sealed with manufacturer-recommended sealant or membrane overlap.',
        'Ceilings above steam showers require full waterproofing. Standard shower ceilings do not need waterproofing unless subject to direct spray from oversized shower heads or body sprays.'
      ]
    },
    {
      heading: 'Flood testing is non-negotiable for peace of mind',
      paragraphs: [
        'A flood test involves plugging the shower drain and filling the shower pan with 2 inches of water for 24 to 48 hours. If the water level drops, there is a leak that must be found and repaired before tiling proceeds. This is the only way to confirm the waterproofing system works.',
        'Some contractors skip flood testing, especially on liquid membrane installations where the drain seal is less visible. Do not accept a quote that omits flood testing. It is the cheapest insurance you can buy for your bathroom remodel.',
        'Waterproofing product warranties from manufacturers like Schluter, Laticrete, and MAPEI require flood testing for warranty validation. If your contractor does not flood test, the manufacturer warranty for the waterproofing system may be void.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Is RedGard as good as Schluter Kerdi?',
      answer: 'Both systems work well when installed correctly. RedGard requires careful application at the right thickness, while Kerdi is more forgiving of installation technique but costs more in materials.'
    },
    {
      question: 'Do I need waterproofing behind all bathroom tile?',
      answer: 'Shower walls and floors require full waterproofing. Tub surrounds need waterproofing above the tub flange. Dry areas like bathroom floors need only a vapor barrier or crack isolation membrane.'
    },
    {
      question: 'Can I waterproof over drywall or do I need cement board?',
      answer: 'Green board drywall is not acceptable for shower walls. Use cement board, densglass, or foam board like Wedi or Kerdi Board as the substrate for waterproofing in wet areas.'
    },
    {
      question: 'How long does bathroom waterproofing take?',
      answer: 'Liquid membranes need 2-3 days for multiple coats and drying. Sheet membrane systems can be installed in one day. Flood testing adds 24-48 hours before tiling.'
    }
  ],
  sources: [
    { label: 'Tile Council of North America Waterproofing Handbook', url: 'https://www.tcnatile.com/' },
    { label: 'Schluter Systems Shower Waterproofing Guide', url: 'https://www.schluter.com/' },
  ],
} as CostGuide;
