// Barrel export for new cost guides
// Each new guide module exports GUIDE_DATA as a CostGuide

export { GUIDE_DATA as flooringCostGuide } from './flooring-cost';
export { GUIDE_DATA as hvacCostGuide } from './hvac-replacement-cost';
export { GUIDE_DATA as electricalCostGuide } from './electrical-wiring-cost';
export { GUIDE_DATA as plumbingCostGuide } from './plumbing-repair-cost';
export { GUIDE_DATA as sidingCostGuide } from './siding-installation-cost';
export { GUIDE_DATA as windowCostGuide } from './window-replacement-cost';
export { GUIDE_DATA as landscapingCostGuide } from './landscaping-budget';
export { GUIDE_DATA as basementCostGuide } from './basement-finishing-cost';
export { GUIDE_DATA as additionCostGuide } from './home-addition-cost';
export { GUIDE_DATA as fencingCostGuide } from './fence-installation-cost';

export const NEW_COST_GUIDES = [
  null, null, null, null, null, null, null, null, null, null,
];
