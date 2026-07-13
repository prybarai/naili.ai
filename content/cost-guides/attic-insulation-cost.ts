import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'attic-insulation-cost',
  title: 'How much does attic insulation cost?',
  description: 'A practical breakdown of attic insulation costs by material type, R-value, air sealing, and what to expect when comparing contractor quotes for energy savings.',
  heroImage: '',
  heroAlt: 'Attic space with newly installed blown-in fiberglass insulation between ceiling joists.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Attic insulation is one of the most cost-effective home energy upgrades you can make, often paying for itself in reduced heating and cooling costs within a few years. But the upfront cost depends heavily on the insulation material, the R-value target, attic size, and how much air sealing is needed.',
    'Blown-in fiberglass or cellulose is the most common and affordable approach, typically running $1.50 to $3.50 per square foot installed. Spray foam costs significantly more but delivers a much higher R-value per inch and seals air leaks automatically.',
    'The real variable is not just insulation cost it is the existing condition of your attic. Air sealing, baffles for ventilation, removing old insulation, and addressing rodent damage all add labor that can double the total project cost.'
  ],
  ranges: [
    { label: 'Blown-in fiberglass or cellulose', range: '$1,500 to $4,000', note: 'Top up existing insulation to R-38 or R-49. Covers 1,000-1,500 sq ft.' },
    { label: 'Fiberglass batt installation', range: '$1,200 to $3,500', note: 'DIY or pro in open attics with standard joist spacing. Lower R-value per inch.' },
    { label: 'Spray foam insulation', range: '$3,500 to $8,000', note: 'Closed-cell or open-cell spray foam. Higher R-value, air seals, and moisture barrier in one.' },
    { label: 'Full attic air seal plus insulation', range: '$3,000 to $7,000', note: 'Seal all penetrations, install baffles, and blow new insulation to code-minimum R-value.' },
  ],
  budgetFactors: [
    { item: 'Existing insulation condition', impact: 'High', note: 'Removing old, contaminated, or rodent-damaged insulation adds significant disposal and prep labor.' },
    { item: 'Air sealing scope', impact: 'High', note: 'Sealing gaps around pipes, wires, chimneys, and attic hatches dramatically improves performance but takes hours of labor.' },
    { item: 'Attic access and obstructions', impact: 'Medium', note: 'Cramped headroom, limited access, knee walls, and ductwork or HVAC equipment in the attic all slow the work.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the R-value target for your climate zone (R-38 for most, R-49 for colder regions) and whether the quote guarantees reaching it.',
    'Ask whether air sealing is included or priced separately. It is the single best performance upgrade.',
    'Verify that baffles or rafter vents are included to maintain proper ventilation and prevent moisture issues.',
    'Check whether old insulation removal and disposal are included, especially if it is contaminated or rodent-infested.',
  ],
  sections: [
    {
      heading: 'Blown-in insulation is the standard for attic retrofits',
      paragraphs: [
        'Blown-in fiberglass or cellulose is the most common choice for attic insulation upgrades because it can be installed quickly over existing insulation, reaches all the irregular spaces between joists, and provides good thermal performance at a reasonable cost. A typical installation takes a few hours for a crew with a blower truck.',
        'Cellulose is made from recycled paper treated with fire retardants and has slightly better R-value per inch than fiberglass. It also settles over time, so contractors usually over-blow by 10% to 20% to compensate. Fiberglass does not settle but costs slightly more per bag.',
        'The biggest advantage of blown-in insulation is that it fills gaps around pipes, wires, and other obstructions much better than batts. That alone can improve the effective R-value by 15% to 25% compared to a batt installation with the same nominal rating.'
      ]
    },
    {
      heading: 'Spray foam delivers premium performance at a premium price',
      paragraphs: [
        'Closed-cell spray foam has the highest R-value per inch at roughly R-6 to R-7 per inch, and it creates an air barrier that eliminates drafts and moisture movement. Open-cell spray foam has a lower R-value per inch but costs less and provides excellent sound dampening.',
        'The big trade-off is cost and application sensitivity. Spray foam requires professional equipment and careful preparation. It cannot be applied in cold weather, and if improperly installed, it can trap moisture or create off-gassing issues. Not every insulation contractor offers spray foam.',
        'For attics with limited space, spray foam is the best way to reach high R-values in a shallow cavity. It also provides structural reinforcement for roof sheathing. But for straightforward attic floor insulation, blown-in is usually the more cost-effective option.'
      ]
    },
    {
      heading: 'Air sealing is the hidden upgrade that matters most',
      paragraphs: [
        'Insulation slows heat transfer, but it does not stop air movement. Air leaks around wiring, plumbing vents, ductwork, chimneys, and attic access panels allow conditioned air to escape and outdoor air to enter, bypassing the insulation entirely. Sealing those gaps before adding insulation dramatically improves energy performance.',
        'Typical air sealing involves applying caulk or spray foam to small gaps around wires and pipes, using rigid materials for larger openings near chimneys and flues, and weatherstripping the attic access panel or pull-down stairs. It is time-consuming but relatively low-cost in materials.',
        'A well-sealed attic with R-49 insulation can perform better than an unsealed attic with R-60 insulation. That is why many energy auditors and insulation contractors recommend air sealing as a prerequisite, not an option.'
      ]
    },
    {
      heading: 'R-value requirements depend on your climate zone',
      paragraphs: [
        'The U.S. Department of Energy recommends R-38 (about 12 inches of fiberglass or 10 inches of cellulose) for attics in most of the country. In colder northern zones, R-49 to R-60 is recommended. Warmer southern zones can get by with R-30 to R-38. Local building codes typically follow these guidelines.',
        'If you are upgrading an existing home, you do not necessarily need to hit the current code minimum for new construction. But aiming for R-38 or higher will provide noticeable energy savings and improved comfort. Many utility companies offer rebates for attic insulation that meets or exceeds code.',
        'Adding insulation on top of existing insulation is usually fine as long as the old insulation is dry, clean, and not compressed. If the old insulation is wet, moldy, or rodent-infested, it must be removed first, which adds to the cost.'
      ]
    },
    {
      heading: 'Ventilation prevents attic moisture problems',
      paragraphs: [
        'Adding insulation without addressing attic ventilation can trap moisture that leads to mold, rot, and ice dams in winter. Proper ventilation requires soffit vents, ridge vents, or gable vents that allow air to flow from the eaves up through the attic and out the ridge.',
        'Baffles or rafter vents are essential when blowing in insulation. These inexpensive plastic or foam channels keep the soffit vents clear so air can enter the attic above the insulation line. Without baffles, blown-in insulation can block soffit vents entirely.',
        'Most insulation contractors include baffles in their attic insulation quotes. If yours does not, ask for them. The cost is minimal, but the moisture protection they provide is critical to the long-term health of your roof and attic.'
      ]
    }
  ],
  faqs: [
    {
      question: 'How long does attic insulation last?',
      answer: 'Fiberglass insulation lasts 80 years or more if kept dry. Cellulose can last 30 to 50 years but may settle more. Both perform well unless compromised by moisture or pests.'
    },
    {
      question: 'Should I remove old insulation before adding new?',
      answer: 'Only if the old insulation is wet, moldy, rodent-infested, or compressed. Dry, clean insulation can be topped up with a new layer.'
    },
    {
      question: 'Does attic insulation qualify for tax credits or rebates?',
      answer: 'Yes. The Inflation Reduction Act and many utility programs offer federal tax credits and local rebates for qualifying attic insulation upgrades. Check with your utility provider and a tax professional.'
    },
    {
      question: 'Can I install attic insulation myself?',
      answer: 'Batts are DIY-friendly in a clean, open attic. Blown-in insulation requires rental equipment and is harder to get right. Spray foam should always be done by a pro.'
    }
  ],
  sources: [
    { label: 'U.S. Department of Energy Attic Insulation Guide', url: 'https://www.energy.gov/energysaver/attic-insulation' },
    { label: 'Energy Star Attic Insulation Recommendations', url: 'https://www.energystar.gov/saveathome/seal-insulate/attics' },
  ],
} as CostGuide;
