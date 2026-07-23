import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { WorkspaceCommunityService } from './workspace-community.service'; import { AddCommunityMemberDto, AddWorkspaceMemberDto, CreateAnnouncementDto, CreateCommunityDto, CreateWorkspaceDto, LinkWorkspaceResourceDto, UpdateWorkspaceDto } from './dto';
@ApiTags('Team Workspaces & Communities') @ApiBearerAuth() @Controller()
export class WorkspaceCommunityController { constructor(private readonly s:WorkspaceCommunityService){}
 @Get('workspaces') @Permissions('workspace.read') workspaces(@CurrentUser()u:AuthenticatedUser){return this.s.listWorkspaces(u.organizationId,u.sub)}
 @Post('workspaces') @Permissions('workspace.create') createWorkspace(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateWorkspaceDto){return this.s.createWorkspace(u.organizationId,u.sub,d)}
 @Get('workspaces/:id') @Permissions('workspace.read') workspace(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.getWorkspace(u.organizationId,u.sub,id)}
 @Patch('workspaces/:id') @Permissions('workspace.manage') updateWorkspace(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateWorkspaceDto){return this.s.updateWorkspace(u.organizationId,u.sub,id,d)}
 @Post('workspaces/:id/members') @Permissions('workspace.member.manage') addMember(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddWorkspaceMemberDto){return this.s.addWorkspaceMember(u.organizationId,u.sub,id,d)}
 @Delete('workspaces/:id/members/:userId') @Permissions('workspace.member.manage') removeMember(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('userId')target:string){return this.s.removeWorkspaceMember(u.organizationId,u.sub,id,target)}
 @Post('workspaces/:id/resources') @Permissions('workspace.manage') link(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:LinkWorkspaceResourceDto){return this.s.linkResource(u.organizationId,u.sub,id,d)}
 @Post('workspaces/:id/announcements') @Permissions('workspace.announce') announce(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateAnnouncementDto){return this.s.announce(u.organizationId,u.sub,id,d)}
 @Get('communities') @Permissions('community.read') communities(@CurrentUser()u:AuthenticatedUser){return this.s.listCommunities(u.organizationId,u.sub)}
 @Post('communities') @Permissions('community.create') createCommunity(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateCommunityDto){return this.s.createCommunity(u.organizationId,u.sub,d)}
 @Post('communities/:id/members') @Permissions('community.moderate') addCommunityMember(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddCommunityMemberDto){return this.s.addCommunityMember(u.organizationId,u.sub,id,d)}
}
