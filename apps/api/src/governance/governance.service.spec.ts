import { GovernanceService } from './governance.service';
describe('GovernanceService', () => {
  it('is constructible with a repository boundary', () => {
    expect(new GovernanceService({} as never)).toBeDefined();
  });
});
