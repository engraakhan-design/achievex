import { ExecutionService } from './execution.service';

describe('ExecutionService strategy contribution', () => {
  const service = new ExecutionService({} as never, {} as never, {} as never);

  it('calculates weighted contribution from project progress', () => {
    expect((service as any).contribution(80, 50)).toBe(40);
  });

  it('clamps progress and weight to safe percentage bounds', () => {
    expect((service as any).contribution(140, 120)).toBe(100);
    expect((service as any).contribution(-10, 50)).toBe(0);
  });
});
