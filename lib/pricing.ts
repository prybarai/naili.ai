export type PricingGuideKey = 'bathroom' | 'interior_paint' | 'deck_patio' | 'roofing' | 'kitchen'
  | 'flooring' | 'hvac' | 'electrical' | 'plumbing' | 'siding' | 'windows' | 'landscaping'
  | 'basement' | 'addition' | 'fencing';

export interface PricingPlanningRange {
  label: string;
  range: string;
  note: string;
}

export interface PricingSourceLink {
  label: string;
  url: string;
}

interface PricingGuideDefinition {
  planningRanges: PricingPlanningRange[];
  estimatorFloor: { low: number; mid: number; high: number };
  scopeMids?: Record<string, number>;
  publicSources: PricingSourceLink[];
}

const PRICING_GUIDES: Record<PricingGuideKey, PricingGuideDefinition> = {
  bathroom: {
    planningRanges: [
      { label: 'Cosmetic refresh', range: '$8,000 to $15,000', note: 'Paint, vanity, fixture swaps, limited tile, minimal plumbing changes.' },
      { label: 'Mid-range remodel', range: '$15,000 to $30,000', note: 'New finishes throughout, better shower/tub work, some electrical and plumbing updates.' },
      { label: 'Full custom or layout change', range: '$30,000+', note: 'Moving plumbing, premium materials, extensive tile, larger primary baths, or structural work.' },
    ],
    estimatorFloor: { low: 8000, mid: 11000, high: 15000 },
    scopeMids: {
      cosmetic: 11000,
      mid_refresh: 22000,
      full_remodel: 36000,
    },
    publicSources: [
      { label: 'Remodeling, Cost vs. Value Report', url: 'https://www.remodeling.hw.net/cost-vs-value/' },
    ],
  },
  interior_paint: {
    planningRanges: [
      { label: 'Single room refresh', range: '$400 to $1,200', note: 'Basic walls, limited prep, normal ceiling height, homeowner-provided clearing.' },
      { label: 'Multi-room repaint', range: '$2,000 to $6,000', note: 'Several rooms, standard prep, trim and ceilings depending on scope.' },
      { label: 'Whole-home interior', range: '$5,000 to $15,000+', note: 'Large square footage, heavy prep, doors, trim, ceilings, stairwells, or premium coatings.' },
    ],
    estimatorFloor: { low: 400, mid: 800, high: 1200 },
    publicSources: [],
  },
  deck_patio: {
    planningRanges: [
      { label: 'Basic pressure-treated deck', range: '$4,000 to $8,000', note: 'Smaller footprint, simple shape, low height, straightforward access.' },
      { label: 'Mid-range family deck', range: '$8,000 to $18,000', note: 'Larger footprint, rails, stairs, upgraded framing or finishes.' },
      { label: 'Premium composite or custom build', range: '$18,000+', note: 'Composite or hardwood, complex layout, multiple elevations, lighting, skirting, or heavy site work.' },
    ],
    estimatorFloor: { low: 4000, mid: 6000, high: 8000 },
    publicSources: [],
  },
  roofing: {
    planningRanges: [
      { label: 'Basic asphalt replacement', range: '$6,000 to $12,000', note: 'Straightforward roof geometry, standard tear-off, common shingle systems.' },
      { label: 'Larger or steeper roof', range: '$12,000 to $20,000', note: 'More squares, harder access, upgraded shingles, more flashing detail.' },
      { label: 'Premium material or complex roof', range: '$20,000+', note: 'Metal, tile, specialty systems, heavy repair scope, or high-complexity rooflines.' },
    ],
    estimatorFloor: { low: 6000, mid: 9000, high: 12000 },
    publicSources: [],
  },
  kitchen: {
    planningRanges: [
      { label: 'Refresh or partial update', range: '$15,000 to $25,000', note: 'Painted or refaced cabinets, counters, backsplash, fixtures, selected appliance updates.' },
      { label: 'Mid-range remodel', range: '$25,000 to $60,000', note: 'New cabinets and counters, flooring, lighting, appliances, moderate trade coordination.' },
      { label: 'Major redesign or premium kitchen', range: '$60,000+', note: 'Layout changes, custom cabinets, premium appliances, structural work, or extensive finish upgrades.' },
    ],
    estimatorFloor: { low: 15000, mid: 20000, high: 25000 },
    scopeMids: {
      cosmetic: 20000,
      mid_refresh: 42500,
      full_remodel: 80000,
    },
    publicSources: [
      { label: 'Remodeling, Cost vs. Value Report', url: 'https://www.remodeling.hw.net/cost-vs-value/' },
    ],
  },
  flooring: {
    planningRanges: [
      { label: 'Strip or replace carpet', range: '$1,000 to $4,000', note: 'Remove old carpet, replace with new, standard padding and labor.' },
      { label: 'Whole-home hard surface', range: '$4,000 to $12,000', note: 'LVP, laminate, or hardwood in multiple rooms, including underlayment, trim, and transitions.' },
      { label: 'Premium or custom flooring', range: '$12,000+', note: 'Tile, stone, wide-plank hardwood, heated floors, intricate patterns, or large-format installations.' },
    ],
    estimatorFloor: { low: 1000, mid: 3000, high: 5000 },
    publicSources: [],
  },
  hvac: {
    planningRanges: [
      { label: 'Furnace or AC replacement', range: '$3,500 to $8,000', note: 'Single-unit replacement, basic efficiency, standard sizing, no major ductwork.' },
      { label: 'Complete system replacement', range: '$8,000 to $15,000', note: 'Replace furnace and AC together, upgraded efficiency, or moderate duct adjustment.' },
      { label: 'Full HVAC renovation', range: '$15,000+', note: 'Mini-splits, heat pumps, zoned systems, new ductwork, or premium inverter equipment.' },
    ],
    estimatorFloor: { low: 3500, mid: 5000, high: 8000 },
    publicSources: [],
  },
  electrical: {
    planningRanges: [
      { label: 'Minor upgrades and repairs', range: '$300 to $2,000', note: 'Outlet additions, fixture replacement, panel breaker swaps, or basic rewiring.' },
      { label: 'Moderate electrical work', range: '$2,000 to $8,000', note: 'Panel upgrade, kitchen/bath circuit additions, lighting system, or limited whole-home rewiring.' },
      { label: 'Major electrical renovation', range: '$8,000+', note: 'Full panel replacement, service upgrade (200A+), whole-home rewiring, or home run work.' },
    ],
    estimatorFloor: { low: 300, mid: 800, high: 2000 },
    publicSources: [],
  },
  plumbing: {
    planningRanges: [
      { label: 'Fixture swaps and minor repairs', range: '$200 to $2,000', note: 'Replace faucet, toilet, or disposal. Fix leaks or clear drains.' },
      { label: 'Moderate plumbing renovation', range: '$2,000 to $8,000', note: 'Water heater replacement, repipe sections, bathroom rough-in, or fixture suite update.' },
      { label: 'Major plumbing repipe or remodel', range: '$8,000+', note: 'Whole-home repipe, main sewer line replacement, kitchen/bath relocation, or drain rebuild.' },
    ],
    estimatorFloor: { low: 200, mid: 600, high: 2000 },
    publicSources: [],
  },
  siding: {
    planningRanges: [
      { label: 'Partial siding repair', range: '$1,500 to $5,000', note: 'Replace damaged sections, limited square footage repair or spot work.' },
      { label: 'Full siding replacement', range: '$8,000 to $20,000', note: 'Standard vinyl, engineered wood, or fiber cement siding on a typical home.' },
      { label: 'Premium siding installation', range: '$20,000+', note: 'Cedar shingles, stone veneer, stucco, extensive trim package, or complex multi-story work.' },
    ],
    estimatorFloor: { low: 1500, mid: 4000, high: 8000 },
    publicSources: [],
  },
  windows: {
    planningRanges: [
      { label: 'Small window replacement', range: '$3,000 to $8,000', note: 'Replace a few windows, standard sizes, vinyl or aluminum frames.' },
      { label: 'Multi-window replacement', range: '$8,000 to $20,000', note: 'Replace most or all windows, mixed sizes, upgraded glazing or frame material.' },
      { label: 'Whole-home premium windows', range: '$20,000+', note: 'Wood or fiberglass frames, custom sizes, historic replication, or high-performance glazing systems.' },
    ],
    estimatorFloor: { low: 3000, mid: 6000, high: 8000 },
    publicSources: [],
  },
  landscaping: {
    planningRanges: [
      { label: 'Basic cleanup and planting', range: '$1,000 to $5,000', note: 'Mulch, annuals, shrubs, trimming, and basic bed cleanup.' },
      { label: 'Mid-range landscape project', range: '$5,000 to $15,000', note: 'Patio or walkway, irrigation system, trees, privacy planting, or outdoor lighting.' },
      { label: 'Full landscape design-build', range: '$15,000+', note: 'Hardscaping, retaining walls, outdoor kitchen, water features, grading, or extensive planting design.' },
    ],
    estimatorFloor: { low: 1000, mid: 3000, high: 5000 },
    publicSources: [],
  },
  basement: {
    planningRanges: [
      { label: 'Basement waterproofing', range: '$2,000 to $10,000', note: 'Interior drainage, sump pump, crack injection, limited excavation or exterior waterproofing.' },
      { label: 'Basic basement finish', range: '$15,000 to $35,000', note: 'Simple open layout, basic finishes, standard ceiling height, limited plumbing or electrical.' },
      { label: 'Premium basement remodel', range: '$35,000+', note: 'Full living space with bath, bar, bedroom, egress windows, custom finishes, or media room.' },
    ],
    estimatorFloor: { low: 2000, mid: 8000, high: 15000 },
    scopeMids: {
      waterproofing: 7500,
      basic_finish: 25000,
      premium_finish: 50000,
    },
    publicSources: [],
  },
  addition: {
    planningRanges: [
      { label: 'Small bump-out addition', range: '$20,000 to $50,000', note: 'Extend a room 4-8 feet, single-story, limited foundation and roof work.' },
      { label: 'Mid-sized room addition', range: '$50,000 to $100,000', note: 'New bedroom, office, or family room addition with foundation, roof, and MEP connections.' },
      { label: 'Large home addition', range: '$100,000+', note: 'Master suite, second story addition, full wing, or extensive structural and MEP work.' },
    ],
    estimatorFloor: { low: 20000, mid: 40000, high: 60000 },
    scopeMids: {
      bump_out: 35000,
      room_addition: 75000,
      master_suite: 125000,
    },
    publicSources: [],
  },
  fencing: {
    planningRanges: [
      { label: 'Chain link or basic fence', range: '$1,500 to $4,000', note: 'Standard chain link or basic pressure-treated wood fence, typical yard size.' },
      { label: 'Privacy fence', range: '$3,000 to $8,000', note: 'Wood or vinyl privacy fence, 6-foot, typical lot with gates.' },
      { label: 'Premium or decorative fence', range: '$8,000+', note: 'Wrought iron, aluminum, hog wire, custom gates, long runs, or difficult terrain.' },
    ],
    estimatorFloor: { low: 1500, mid: 3000, high: 4000 },
    publicSources: [],
  },
};

export function getPricingPlanningRanges(key: PricingGuideKey) {
  return PRICING_GUIDES[key].planningRanges.map((item) => ({ ...item }));
}

export function getPricingPublicSources(key: PricingGuideKey) {
  return PRICING_GUIDES[key].publicSources.map((item) => ({ ...item }));
}

export function getEstimatorFloor(key: PricingGuideKey) {
  return PRICING_GUIDES[key].estimatorFloor;
}

export function getScopeMids(key: Extract<PricingGuideKey, 'bathroom' | 'kitchen' | 'basement' | 'addition'>) {
  return { ...(PRICING_GUIDES[key].scopeMids || {}) };
}
