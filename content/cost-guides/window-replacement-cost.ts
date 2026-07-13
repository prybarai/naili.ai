import { CostGuide, CostGuideSection, CostGuideFaq, CostGuideBudgetFactor } from '@/lib/costGuides';
import { getPricingPlanningRanges, getPricingPublicSources } from '@/lib/pricing';

export const GUIDE_DATA = {
  slug: 'window-replacement-cost',
  title: 'How much does window replacement cost?',
  description: 'A practical breakdown of window replacement costs by frame type, glass options, installation method, and what affects the price beyond the window itself.',
  heroImage: '/imagery/cost-guide-windows.webp',
  heroAlt: 'Bright living room with large double-hung windows and natural light streaming in.',
  publishedAt: '2026-07-13',
  updatedAt: '2026-07-13',
  author: { name: 'Naili editorial team', role: 'Research, writing, and homeowner guidance' },
  reviewer: { name: 'Prybar contractor review', role: 'Scope and pricing sanity review' },
  intro: [
    'Window replacement pricing is deceptive because the cost per window sounds manageable, but the full project price multiplies quickly across a whole home. A single window in a standard opening is one price. Custom sizes, historical profiles, multiple stories, and interior-exterior finish coordination change the math significantly.',
    'For planning, replacing a small number of standard-sized windows often falls between $3,000 and $8,000. Replacing most or all windows in a typical home lands between $8,000 and $20,000 or more, depending on frame material, glass package, and installation complexity. Premium wood or fiberglass windows with high-performance glazing can push the total well beyond $20,000.',
    'The trap homeowners fall into is comparing window prices without matching the glass package, frame material, installation method, and included trim work. Two "window quotes" can differ by 30% or more for the same opening if one uses a basic dual-pane vinyl insert and the other includes low-e coating, argon fill, reinforced frames, full exterior and interior trim, and proper flashing.'
  ],
  ranges: getPricingPlanningRanges('windows'),
  budgetFactors: [
    { item: 'Frame material', impact: 'High', note: 'Vinyl is the most affordable, while wood, aluminum-clad wood, and fiberglass cost more but offer different performance and aesthetic benefits.' },
    { item: 'Glass and glazing package', impact: 'High', note: 'Dual-pane, triple-pane, low-e coatings, gas fills, and sound control all add cost but change energy performance significantly.' },
    { item: 'Installation method and trim', impact: 'Medium', note: 'Full-frame replacement costs more than pocket (insert) installation, and new interior and exterior trim adds labor, material, and paint time.' },
  ] as CostGuideBudgetFactor[],
  quoteChecklist: [
    'Confirm whether the quote is for pocket (insert) or full-frame replacement — they are different scopes with different performance outcomes.',
    'Ask for exact glass specs: number of panes, low-e coating type, gas fill, and U-factor/SHGC ratings.',
    'Check what trim work is included — interior casing, exterior brick mold or jamb extensions, and sill/flashing details.',
    'Clarify warranty terms: glass breakage, seal failure, frame defects, and labor coverage should all be spelled out.',
  ],
  sections: [
    {
      heading: 'Frame material is the biggest price driver',
      paragraphs: [
        'Vinyl windows dominate the market because they offer solid performance at an accessible price point. They are energy efficient, low maintenance, and widely available. The limitation is that dark colors can be hard to get, and the frame profile is bulkier than wood or fiberglass.',
        'Wood and aluminum-clad wood windows cost more but appeal to homeowners who want a traditional look, slimmer frame profiles, and paint-grade interior finishes. Fiberglass windows sit at the premium end, offering the slim appearance of wood with better dimensional stability, lower maintenance, and excellent thermal performance.',
        'The right material depends on the look you want, the climate, and whether you are matching existing windows in a historic or custom home. Within each material category, the brand and product line also matter. A mid-tier vinyl window is different from a premium vinyl window with welded frames, reinforced sashes, and better hardware.'
      ]
    },
    {
      heading: 'Full-frame replacement vs. pocket installation',
      paragraphs: [
        'Pocket (insert) windows fit inside the existing frame, leaving the exterior brick mold and interior jamb intact. They are faster, less invasive, and generally more affordable. The downside is that the new window is smaller than the original rough opening, and if the existing frame has rot or damage, a pocket install hides rather than fixes it.',
        'Full-frame replacement removes the existing window and frame down to the rough opening, then installs a new frame with proper flashing and insulation. It is the right approach when the existing frame is damaged, when you want to preserve the maximum glass area, or when code requires a full replacement. It costs more and takes longer.',
        'For a few problem windows, pocket installation is often fine. For a whole-home replacement or for windows with known frame issues, full-frame is the more durable answer. A good contractor will advise based on what they see during inspection, not just default to whichever method is more profitable.'
      ]
    },
    {
      heading: 'Glass and glazing: the performance story behind the cost',
      paragraphs: [
        'The glass package is where window performance is made or lost. Standard dual-pane glass is the baseline. Adding low-e coatings, argon or krypton gas fill, and warm-edge spacers improves the U-factor and solar heat gain coefficient. Triple-pane glass offers even better performance, particularly in cold climates, but adds weight, cost, and reduces visible light slightly.',
        'The right glass package depends on your climate and which rooms the windows serve. South-facing windows benefit from low solar heat gain coatings to reduce cooling load. North-facing windows where heat loss is the main concern benefit from lower U-factors. A window that is perfect for Arizona is not the same as one for Minnesota.',
        'Sound control is another glazing consideration for homes near busy streets or airports. Laminated glass, asymmetric panes, or specialized acoustic glazing can meaningfully reduce noise transmission but add cost compared to standard glass. If noise is not a problem, you can skip that upgrade.'
      ]
    },
    {
      heading: 'The hidden costs: trim, flashing, and access',
      paragraphs: [
        'Interior and exterior trim, sill extensions, brick mold, and flashing are all required to make a window look finished and perform correctly. Some window quotes include these. Others price them separately or treat them as optional upgrades. They are not optional for a proper installation.',
        'Second and third-story windows require scaffolding or lift equipment, which adds cost. Windows in finished basements or above built-ins add labor. Bay, bow, casement, awning, and specialty shapes all cost more per opening than standard double-hung or slider windows because of increased materials and installation time.',
        'Old paint that may contain lead is another factor in older homes. Lead-safe renovation practices require containment, HEPA filtering, and certified workers. That adds time and cost but is required by law for homes built before 1978.'
      ]
    },
    {
      heading: 'How to compare window quotes without the sales pressure',
      paragraphs: [
        'Ask for each quote to specify the frame material brand and model, glass package, U-factor and SHGC ratings, installation method (pocket vs. full-frame), what trim work is included, and the warranty terms for both product and labor. A quote that answers all of these is more useful than one that only lists a total price and a brand name.',
        'Be wary of "buy one get one" or "limited time pricing" window sales. The window market is competitive, and legitimate pricing should not require artificial urgency. A good window quote stands on its own merit.',
        'Get a custom estimate for your specific home, upload a photo and we will build the brief. Naili helps you organize window counts, sizes, desired materials, and performance goals so you can get cleaner quotes from fewer rounds of back-and-forth.'
      ]
    }
  ],
  faqs: [
    {
      question: 'Should I replace all windows at once or one at a time?',
      answer: 'All at once is more efficient if the budget allows. The crew mobilizes once, and you avoid mismatched sizing, color, and performance between old and new windows.'
    },
    {
      question: 'Do new windows really save money on energy?',
      answer: 'They can, especially if replacing single-pane or drafty windows. The savings depend on climate, existing window condition, and the efficiency of the new units.'
    },
    {
      question: 'What is the best window brand?',
      answer: 'There is no single best brand. Look for NFRC-certified ratings, a solid warranty, and a local installer with good reviews rather than fixating on brand alone.'
    },
    {
      question: 'Can I replace windows myself?',
      answer: 'For handy homeowners, yes, but window installation is detail-heavy work. Improper flashing and sealing can lead to leaks, rot, and voided warranties.'
    }
  ],
  sources: getPricingPublicSources('windows'),
} as CostGuide;
