import { Module } from '@nestjs/common'; import { KnowledgePlatformController } from './knowledge-platform.controller'; import { KnowledgePlatformService } from './knowledge-platform.service';
@Module({controllers:[KnowledgePlatformController],providers:[KnowledgePlatformService],exports:[KnowledgePlatformService]}) export class KnowledgePlatformModule {}
