export type AnalyticsProject = {
  id: string; key: string; name: string; status: string; health: string; progress: unknown;
  budget: unknown; actualCost: unknown; startDate: Date | null; targetDate: Date | null;
  portfolioId?: string | null; programId?: string | null;
};

export function projectVariance(project: AnalyticsProject, now = new Date()) {
  const budget = Number(project.budget ?? 0);
  const actualCost = Number(project.actualCost ?? 0);
  const progress = Math.max(0, Math.min(100, Number(project.progress ?? 0)));
  const budgetVariance = actualCost - budget;
  const budgetVariancePercent = budget > 0 ? (budgetVariance / budget) * 100 : 0;
  const start = project.startDate?.getTime();
  const target = project.targetDate?.getTime();
  const current = now.getTime();
  const expectedProgress = start && target && target > start
    ? Math.max(0, Math.min(100, ((current - start) / (target - start)) * 100))
    : 0;
  return {
    budget,
    actualCost,
    budgetVariance,
    budgetVariancePercent,
    expectedProgress,
    scheduleVariancePoints: progress - expectedProgress,
    daysRemaining: target ? Math.ceil((target - current) / 86400000) : null,
  };
}

export function portfolioRollup(projects: AnalyticsProject[], now = new Date()) {
  const variances = projects.map(project => ({ project, ...projectVariance(project, now) }));
  const active = projects.filter(project => !['COMPLETED', 'CANCELLED'].includes(project.status));
  const atRisk = projects.filter(project => ['AT_RISK', 'OFF_TRACK'].includes(project.health));
  const totalBudget = variances.reduce((sum, item) => sum + item.budget, 0);
  const actualCost = variances.reduce((sum, item) => sum + item.actualCost, 0);
  return {
    projects: projects.length,
    activeProjects: active.length,
    atRiskProjects: atRisk.length,
    averageProgress: projects.length ? projects.reduce((sum, project) => sum + Number(project.progress ?? 0), 0) / projects.length : 0,
    totalBudget,
    actualCost,
    budgetVariance: actualCost - totalBudget,
    budgetVariancePercent: totalBudget > 0 ? ((actualCost - totalBudget) / totalBudget) * 100 : 0,
    averageScheduleVariance: projects.length ? variances.reduce((sum, item) => sum + item.scheduleVariancePoints, 0) / projects.length : 0,
    healthDistribution: {
      onTrack: projects.filter(project => project.health === 'ON_TRACK').length,
      atRisk: projects.filter(project => project.health === 'AT_RISK').length,
      offTrack: projects.filter(project => project.health === 'OFF_TRACK').length,
      notSet: projects.filter(project => project.health === 'NOT_SET').length,
    },
  };
}

export function riskScore(probability: string, impact: string) {
  const scale: Record<string, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  return (scale[probability] ?? 1) * (scale[impact] ?? 1);
}
