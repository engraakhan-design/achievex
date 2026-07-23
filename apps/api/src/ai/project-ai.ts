export type DeliveryFacts = {
  progress: number;
  scheduleVariancePoints: number;
  budgetVariancePercent: number;
  overdueTasks: number;
  overdueMilestones: number;
  highRisks: number;
  criticalIssues: number;
  blockedDependencies: number;
};

export function projectRiskScore(facts: DeliveryFacts) {
  const score =
    Math.max(0, -facts.scheduleVariancePoints) * 0.25 +
    Math.max(0, facts.budgetVariancePercent) * 0.2 +
    facts.overdueTasks * 2 +
    facts.overdueMilestones * 4 +
    facts.highRisks * 5 +
    facts.criticalIssues * 7 +
    facts.blockedDependencies * 4;
  return Math.round(Math.min(100, score));
}

export function riskBand(score: number) {
  if (score >= 60) return 'CRITICAL';
  if (score >= 35) return 'HIGH';
  if (score >= 15) return 'MEDIUM';
  return 'LOW';
}

export function suggestedMitigations(facts: DeliveryFacts) {
  const actions: string[] = [];
  if (facts.scheduleVariancePoints < -10) actions.push('Re-baseline the critical path and assign recovery owners to delayed milestones.');
  if (facts.budgetVariancePercent > 10) actions.push('Review scope, vendor commitments, and remaining cost-to-complete with the sponsor.');
  if (facts.overdueTasks > 0) actions.push('Triage overdue tasks, remove blockers, and reset due dates only with explicit owner commitment.');
  if (facts.overdueMilestones > 0) actions.push('Escalate missed milestones and define a dated recovery plan.');
  if (facts.highRisks > 0) actions.push('Convert the highest-exposure risks into funded mitigation actions with owners and due dates.');
  if (facts.criticalIssues > 0) actions.push('Create an executive decision path for unresolved critical issues.');
  if (facts.blockedDependencies > 0) actions.push('Agree dependency handoff dates with upstream project owners and track them as executive commitments.');
  return actions.length ? actions : ['Maintain delivery cadence and validate leading indicators at the next project review.'];
}
