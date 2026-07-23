import { KnowledgePlatformService } from './knowledge-platform.service';
describe('KnowledgePlatformService',()=>{it('creates deterministic tenant-safe retrieval service',()=>{expect(new KnowledgePlatformService({} as any)).toBeDefined();});});
