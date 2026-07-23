import { ExecutiveDashboardService } from './executive-dashboard.service';
describe('ExecutiveDashboardService',()=>{
 it('rejects unknown executive audiences',async()=>{const service=new ExecutiveDashboardService({} as any);await expect(service.ensureTemplate('o','u','UNKNOWN')).rejects.toThrow('Unsupported executive audience')});
});
