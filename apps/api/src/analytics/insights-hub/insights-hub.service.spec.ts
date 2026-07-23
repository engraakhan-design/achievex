import { InsightsHubService } from './insights-hub.service';
describe('InsightsHubService',()=>{it('constructs with a tenant-scoped prisma dependency',()=>{expect(new InsightsHubService({} as any)).toBeDefined()})})
