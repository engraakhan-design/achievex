import { DataSyncPlatformService } from './data-sync-platform.service';
describe('DataSyncPlatformService',()=>{
  it('constructs without executing provider adapters',()=>{
    const prisma={} as any;
    expect(new DataSyncPlatformService(prisma)).toBeDefined();
  });
});
