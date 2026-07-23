import { portfolioRollup, projectVariance, riskScore } from './execution-analytics';

describe('execution analytics', () => {
  const now = new Date('2026-07-15T00:00:00.000Z');
  it('calculates schedule and budget variance', () => {
    const result = projectVariance({ id:'p1',key:'P1',name:'Project',status:'ACTIVE',health:'ON_TRACK',progress:40,budget:100,actualCost:120,startDate:new Date('2026-07-01'),targetDate:new Date('2026-07-29') }, now);
    expect(Math.round(result.expectedProgress)).toBe(50);
    expect(Math.round(result.scheduleVariancePoints)).toBe(-10);
    expect(result.budgetVariance).toBe(20);
    expect(Math.round(result.budgetVariancePercent)).toBe(20);
  });
  it('aggregates portfolio delivery', () => {
    const result = portfolioRollup([
      { id:'p1',key:'P1',name:'One',status:'ACTIVE',health:'AT_RISK',progress:50,budget:100,actualCost:80,startDate:null,targetDate:null },
      { id:'p2',key:'P2',name:'Two',status:'COMPLETED',health:'ON_TRACK',progress:100,budget:100,actualCost:110,startDate:null,targetDate:null },
    ], now);
    expect(result.projects).toBe(2);
    expect(result.activeProjects).toBe(1);
    expect(result.atRiskProjects).toBe(1);
    expect(result.averageProgress).toBe(75);
    expect(result.budgetVariance).toBe(-10);
  });
  it('ranks probability and impact exposure', () => {
    expect(riskScore('HIGH','CRITICAL')).toBe(12);
    expect(riskScore('LOW','LOW')).toBe(1);
  });
});
