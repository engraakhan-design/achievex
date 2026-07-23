import { projectRiskScore, riskBand, suggestedMitigations } from './project-ai';
describe('project AI delivery heuristics', () => {
  it('keeps a healthy project low risk', () => {
    const facts={progress:70,scheduleVariancePoints:5,budgetVariancePercent:0,overdueTasks:0,overdueMilestones:0,highRisks:0,criticalIssues:0,blockedDependencies:0};
    expect(riskBand(projectRiskScore(facts))).toBe('LOW');
  });
  it('escalates compound delivery exposure', () => {
    const facts={progress:35,scheduleVariancePoints:-25,budgetVariancePercent:18,overdueTasks:5,overdueMilestones:2,highRisks:2,criticalIssues:1,blockedDependencies:2};
    expect(['HIGH','CRITICAL']).toContain(riskBand(projectRiskScore(facts)));
    expect(suggestedMitigations(facts).length).toBeGreaterThan(4);
  });
});
