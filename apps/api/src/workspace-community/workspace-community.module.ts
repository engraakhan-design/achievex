import { Module } from '@nestjs/common'; import { WorkspaceCommunityController } from './workspace-community.controller'; import { WorkspaceCommunityService } from './workspace-community.service';
@Module({controllers:[WorkspaceCommunityController],providers:[WorkspaceCommunityService],exports:[WorkspaceCommunityService]}) export class WorkspaceCommunityModule{}
