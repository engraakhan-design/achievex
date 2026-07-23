import { Module } from '@nestjs/common';
import { DataSyncPlatformController } from './data-sync-platform.controller';
import { DataSyncPlatformService } from './data-sync-platform.service';
@Module({controllers:[DataSyncPlatformController],providers:[DataSyncPlatformService],exports:[DataSyncPlatformService]})
export class DataSyncPlatformModule {}
