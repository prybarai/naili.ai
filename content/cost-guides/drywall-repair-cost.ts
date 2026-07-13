import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'drywall-repair-cost',
  title: 'How much does drywall repair cost?',
  description: 'A practical breakdown of drywall repair costs by damage type, from small nail holes and patches to full wall replacement, texturing, and skim coating.',
  heroImage: '',
  heroAlt: 'Drywall contractor applying joint compound and tape to a newly patched wall section.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Drywall repair is one of the most common home maintenance tasks, and costs range from less than $100 for a small patch to $1,000 or more for a full replacement or skim coat of an entire wall. The damage size, texture matching, and whether repainting is included all affect the price.',
    'Small holes from nails, screws, or minor dings cost $50 to $150 per repair. Medium holes up to 12 inches across from doorknobs or furniture impacts run $200 to $500. Large sections with water damage, structural cracking, or full room replacement can go from $500 to $2,000 or more.',
    'Texture matching is the most underestimated cost driver. Orange peel, knockdown, popcorn, or smooth finishes each require different techniques and skill levels, and poorly matched texture is obvious in good lighting.'
  ],
  ranges: [
    { label: 'Small patch hole (nail/screw)', range: '$50 to $150', note: 'Quick patch of holes under 2 inches. Includes compound, sanding, and touch-up paint on an existing wall.' },
    { label: 'Medium patch or hole repair', range: '$200 to $500', note: 'Holes 2 to 12 inches. Requires backing, filler, tape, multiple coats of compound, and sanding.' },
    { label: 'Large section or full panel replacement', range: '$500 to $1,500', note: 'Cutting out and replacing damaged drywall, taping, mudding, sanding, and texture matching.' },
    { label: 'Skim coat entire room', range: '$800 to $2,500', note: 'Applying thin layer of joint compound over entire walls and ceiling to create smooth finish. Covers heavy texture or damage.' },
    { label: 'Water damage repair (drywall portion)', range: '$400 to $2,000', note: 'Remove and replace water-damaged drywall, treat for mold if present, tape, mud, texture, and paint.' },
  ],
  budgetFactors: [
    { item: 'Texture matching difficulty', impact: 'High', note: 'Matching knockdown, orange peel, or popcorn texture requires skill and the right tools. Smooth finish repairs are the easiest to blend.' },
    { item: 'Patching compound layers', impact: 'High', note: 'Each coat of compound requires drying time. Multiple coats for larger patches mean more labor time and days of work.' },
    { item: 'Paint coverage and priming', impact: 'Medium', note: 'Repaired areas must be primed before painting. The entire wall may need repainting to make the repair invisible, adding to material cost.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm the quote includes all coats of compound, sanding, texture matching, priming, and painting. Some drywall quotes only cover the patch, not the finish.',
    'Ask about texture matching method and whether the contractor will test the texture on a scrap board before applying to the repair.',
    'Check whether the contractor blends the repair into the surrounding wall or patches only the damaged area. Blending is more work but looks better.',
    'Clarify drying time between coats. Good drywall repair takes multiple days for larger patches and full room work.',
  ],
  sections: [
    {
      heading: 'Small repairs are easy but the match matters',
      paragraphs: [
        'A small nail or screw hole is the simplest drywall repair. It involves filling the hole with lightweight spackle or joint compound, letting it dry, sanding it smooth, and touching up the paint. Most homeowners can do this themselves, but a pro will get a cleaner, less noticeable result.',
        'Dents from chairs, furniture, or impacts are similar in approach but may need compound applied in two thin layers to avoid shrinking or cracking. Each layer needs drying time, which adds a day between coats.',
        'The trickiest part of small repairs is paint matching. Even if you have the original paint, the repaired area may flash or show through because the texture and porosity of the new compound differ from the surrounding wall. Prime the repair before painting for the best result.'
      ]
    },
    {
      heading: 'Medium holes need backing and careful technique',
      paragraphs: [
        'Holes between 2 and 12 inches require a backing piece such as a scrap of drywall, wood, or a drywall repair clip to support the patch. The patch piece is cut to size, screwed to the backing, and then taped and mudded over.',
        'The California patch technique is common for holes without backing. The repair drywall is cut larger than the hole, the perimeter paper is left attached, and the patch is glued or screwed in place. The paper provides the tape surface for compound.',
        'Mid-size holes are where drywall repair transitions from DIY-friendly to worth hiring a pro. The finish quality, speed, and texture matching that a pro achieves is usually better than what a novice can do, and the cost difference is relatively small.'
      ]
    },
    {
      heading: 'Water damage repair requires addressing the cause first',
      paragraphs: [
        'Water-damaged drywall must be cut out and replaced, not just patched over. The affected area should be cut back to a point where the drywall is completely dry and structurally sound. The repair involves removing the damaged section, treating any mold, replacing the drywall, and refinishing the entire area.',
        'The cause of the water damage must be fixed before closing the wall back up. Whether it is a pipe leak, roof leak, or condensation issue, the source must be resolved or the damage will recur. This is why water damage drywall repair often happens after plumbers or roofers have done their work.',
        'Mold on drywall triggered by prolonged moisture may need professional remediation, especially if the affected area exceeds 10 square feet. The mold remediation step adds cost and time before the drywall repair can proceed.'
      ]
    },
    {
      heading: 'Full room replacement or skim coating for major issues',
      paragraphs: [
        'Sometimes the damage is extensive enough that replacing entire sheets of drywall is faster and more cost-effective than patching many small areas. This is common after floods, large structural repairs, or when removing old wall coverings like wood paneling.',
        'Skim coating involves applying a thin layer of joint compound over the entire wall and ceiling surface to create a smooth, uniform finish. It is commonly used to hide heavy texture like popcorn ceilings, repair widespread minor damage, or prepare a wall for high-gloss paint that shows every imperfection.',
        'Skim coating a room costs $800 to $2,500 depending on room size, ceiling height, and the condition of the existing walls. It is labor-intensive but transforms the look of a room completely.'
      ]
    },
    {
      heading: 'Texture matching is the difference between invisible and obvious',
      paragraphs: [
        'Smooth wall repairs are the easiest to match because a good sanding job and proper priming make the patch disappear. Textured surfaces like orange peel, knockdown, or popcorn are harder because matching the pattern, density, and application method across the patch area takes practice.',
        'Knockdown texture is created by spraying joint compound in a stippled pattern and then knocking down the peaks with a wide knife before they dry. Orange peel uses a finer spray with less flattening. Popcorn texture uses a specialized hopper gun with aggregate mixed in.',
        'Experienced drywall contractors can usually match existing texture on the first try, but they may test a small area first to confirm. If you are repainting the entire wall after the repair, the texture match does not need to be perfect. If you are only touching up the repair area, it must match exactly.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Can I repair drywall myself to save money?',
      answer: 'Yes for small nail holes and minor dings. Larger holes, texture matching, and water damage repairs are usually worth hiring a pro unless you have experience.'
    },
    {
      question: 'How long does drywall repair take?',
      answer: 'Small patches dry in a few hours. Medium repairs with multiple compound coats take 2-3 days. Full room work or water damage repairs can take 3-7 days.'
    },
    {
      question: 'Do I need to repaint the whole wall after repair?',
      answer: 'You can touch up a small, well-blended repair. For larger patches or textured walls, painting the entire wall is recommended to avoid flashing or sheen differences.'
    },
    {
      question: 'What is the best way to patch a hole without backing?',
      answer: 'The California patch technique or a mesh-backed drywall patch kit are the two most effective methods for backing-less holes up to 6 inches.'
    }
  ],
  sources: [
    { label: 'USG Drywall Application Guide', url: 'https://www.usg.com/' },
    { label: 'National Association of Home Builders, Drywall Installation Guide', url: 'https://www.nahb.org/' },
  ],
} as CostGuide;
