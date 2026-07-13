import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'water-damage-restoration-cost',
  title: 'How much does water damage restoration cost?',
  description: 'A practical breakdown of water damage restoration costs by water source, damage category, drying time, and what to expect when dealing with mold remediation and structural repairs.',
  heroImage: '',
  heroAlt: 'Residential water damage restoration with industrial drying equipment and dehumidifiers in a flooded basement.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Water damage restoration costs vary enormously because the final bill depends not just on how much water there is, but on how fast you respond, what kind of water caused the damage, and how long materials stay wet before drying begins.',
    'Minor water extraction and drying in a small area might cost $500 to $2,000, while a Category 3 flood cleanup with structural drying, drywall removal, and mold remediation can quickly exceed $10,000 to $20,000. The earlier you catch it, the lower the cost.',
    'The three water categories (clean, gray, black) determine the level of safety protocols and material disposal required, which directly impacts cost. A burst pipe in a clean water supply is far cheaper to remediate than a sewage backup.'
  ],
  ranges: [
    { label: 'Minor extraction and drying', range: '$500 to $2,500', note: 'Small leak or overflow, clean water, limited square footage, 2-3 days of drying equipment.' },
    { label: 'Moderate water damage repair', range: '$2,500 to $7,000', note: 'Category 1 or 2 water, affected drywall and flooring removal, 5-7 days of drying.' },
    { label: 'Major flood and mold remediation', range: '$7,000 to $20,000+', note: 'Category 3 water, extensive demolition, mold treatment, structural drying, and rebuild.' },
    { label: 'Full crawlspace or basement flood', range: '$10,000 to $30,000+', note: 'Standing water, subfloor replacement, pump systems, vapor barrier, and full rebuild.' },
  ],
  budgetFactors: [
    { item: 'Water contamination category', impact: 'High', note: 'Clean (Category 1), gray (Category 2), and black (Category 3) water have dramatically different handling, safety, and disposal requirements.' },
    { item: 'Response time', impact: 'High', note: 'Water that sits for more than 48 hours promotes mold growth, requiring far more extensive remediation.' },
    { item: 'Materials affected', impact: 'Medium', note: 'Drywall, carpet, hardwood, subfloor, insulation, and cabinetry each have different drying or replacement cost profiles.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Ask for the water category classification in writing. Category determines safety protocols and material disposal requirements.',
    'Confirm that moisture mapping and drying verification (using moisture meters and thermal imaging) are part of the quote.',
    'Clarify mold remediation scope. Some quotes stop at drying; mold removal is a separate line item.',
    'Check whether the quote covers reconstruction (drywall, flooring, paint) or only demolition and drying.',
  ],
  sections: [
    {
      heading: 'Water categories define the scope and cost',
      paragraphs: [
        'Category 1 water comes from a clean source like a burst supply line, faucet overflow, or rainwater. It poses no immediate health risk and the least expensive to remediate because no special handling is needed for affected materials.',
        'Category 2 or gray water contains some contamination from appliance discharge, dishwasher overflow, or toilet overflow (without feces). It can cause illness if ingested and requires more careful extraction, antimicrobial treatment, and disposal of porous materials.',
        'Category 3 or black water is grossly contaminated with sewage, floodwater from rivers or storms, or standing water with bacterial growth. It requires full hazmat-level protocols, complete removal of affected porous materials, and professional disinfection.'
      ]
    },
    {
      heading: 'Drying time and equipment drive the restoration bill',
      paragraphs: [
        'Professional water restoration uses industrial air movers, dehumidifiers, and moisture meters to dry the affected area quickly. The drying time depends on how porous the materials are, how much water was absorbed, and the ambient humidity.',
        'Equipment rental is charged per day per unit. A typical setup runs 3 to 7 days, with multiple air movers and dehumidifiers placed strategically. Some companies include equipment in their flat rate; others itemize it. Make sure you understand which model you are being quoted.',
        'Drying verification is critical. A contractor should use moisture meters and thermal imaging to confirm that all materials are fully dry before reconstruction begins. Closing up walls prematurely traps moisture and guarantees mold growth.'
      ]
    },
    {
      heading: 'Mold remediation often emerges as a hidden cost',
      paragraphs: [
        'Mold can start growing within 24 to 48 hours of water exposure, especially on porous materials like drywall, wood, and carpet. If the water damage is discovered late or drying is incomplete, mold remediation becomes an entirely separate project with its own costs.',
        'Small affected areas under 10 square feet can often be cleaned with antimicrobial treatments by the restoration crew. Larger areas or HVAC system contamination require containment, HEPA filtration, and professional mold remediation specialists.',
        'Mold testing is not always necessary unless you need to confirm the species or confirm that remediation was successful. Some insurance policies require testing, and some do not. Ask your contractor and your insurer before authorizing the testing.'
      ]
    },
    {
      heading: 'Insurance coverage and the claims process',
      paragraphs: [
        'Standard homeowners insurance typically covers sudden and accidental water damage from burst pipes, appliance failures, and storm-related water entry. It does not cover flood damage from rising water that is separate flood insurance or gradual leaks or maintenance issues.',
        'When you file a claim, the insurance adjuster will assess the damage and determine a payout based on your policy. Many restoration companies work directly with insurers and can help coordinate the estimate, but you should never authorize work beyond what your policy covers without written agreement.',
        'Document everything. Photos, videos, moisture readings, and a written timeline of the event and your response make the claims process smoother. Keep receipts for any emergency mitigation work you authorize.'
      ]
    },
    {
      heading: 'Prevention is dramatically cheaper than restoration',
      paragraphs: [
        'Water damage restoration is expensive because it involves emergency response, specialized equipment, demolition, drying, mold remediation, and reconstruction. Addressing small leaks when they appear, installing leak detection systems, and maintaining your plumbing and roof are far more cost-effective.',
        'Simple upgrades like stainless steel braided supply lines for washing machines and toilets, drip pans under water heaters, and smart water shutoff valves can prevent the most common sources of catastrophic water damage. These upgrades cost hundreds, while restoration costs thousands.',
        'Regular maintenance checks of your roof, gutters, downspouts, plumbing, and appliances provide early warning of potential problems. A $200 plumbing inspection is much easier on the budget than a $10,000 water damage restoration.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Does homeowners insurance cover water damage restoration?',
      answer: 'It covers sudden and accidental damage from burst pipes and appliance failures, but not gradual leaks, maintenance issues, or flood damage from rising water (separate flood insurance required).'
    },
    {
      question: 'How long does water damage restoration take?',
      answer: 'Extraction and drying typically take 3 to 7 days. Full restoration including demolition, drying, mold remediation, and reconstruction can take 2 to 6 weeks depending on the extent of damage.'
    },
    {
      question: 'Can I dry water damage myself to save money?',
      answer: 'Only for very small, clean-water spills on non-porous surfaces. Any significant water intrusion requires industrial drying equipment and moisture verification to prevent mold growth.'
    },
    {
      question: 'When is mold remediation needed after water damage?',
      answer: 'Mold remediation is needed if porous materials were wet for more than 48 hours, visible mold is present, or a musty odor persists after drying. Testing can confirm but is not always required.'
    }
  ],
  sources: [
    { label: 'IICRC Standards for Water Damage Restoration', url: 'https://www.iicrc.org/standards/' },
    { label: 'EPA Guide to Mold, Moisture, and Your Home', url: 'https://www.epa.gov/mold/mold-and-moisture-your-home' },
  ],
} as CostGuide;
