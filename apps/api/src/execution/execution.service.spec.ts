import { ExecutionService } from './execution.service';

describe('ExecutionService health scoring', () => {
  const service = new ExecutionService({} as never, {} as never, {} as never);
  const base = { budget: 100000, actualCost: 90000, startDate: new Date(Date.now() - 50 * 86400000), targetDate: new Date(Date.now() + 50 * 86400000), progress: 55 };
  it('marks a healthy project on track', () => {
    const result = (service as any).calculateHealth({ project: base, overdueTasks: 0, overdueMilestones: 0, criticalIssues: 0, highRisks: 0 });
    expect(result.health).toBe('ON_TRACK');
  });
  it('marks serious delivery exposure off track', () => {
    const result = (service as any).calculateHealth({ project: { ...base, progress: 10, actualCost: 130000 }, overdueTasks: 4, overdueMilestones: 1, criticalIssues: 1, highRisks: 1 });
    expect(result.health).toBe('OFF_TRACK');
    expect(result.score).toBeGreaterThanOrEqual(6);
  });
});
