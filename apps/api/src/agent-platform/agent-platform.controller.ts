import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { Permissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types'; import { AgentPlatformService } from './agent-platform.service'; import { CreateAgentDto, RunAgentDto, ToolDecisionDto, UpdateAgentDto } from './dto';
@ApiTags('AI Agents') @ApiBearerAuth() @Controller('agents') export class AgentPlatformController {constructor(private readonly s:AgentPlatformService){}
@Get() @Permissions('ai.agent.read') list(@CurrentUser()u:AuthenticatedUser){return this.s.list(u.organizationId)}
@Post() @Permissions('ai.agent.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAgentDto){return this.s.create(u.organizationId,u.sub,d)}
@Patch(':id') @Permissions('ai.agent.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateAgentDto){return this.s.update(u.organizationId,id,d)}
@Get('tools/catalog') @Permissions('ai.agent.read') tools(){return this.s.toolsList()}
@Post(':id/runs') @Permissions('ai.agent.execute') run(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:RunAgentDto){return this.s.run(u.organizationId,u.sub,id,d)}
@Get('runs/:id') @Permissions('ai.agent.read') getRun(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.getRun(u.organizationId,id)}
@Post('approvals/:id/approve') @Permissions('ai.agent.approve') approve(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ToolDecisionDto){return this.s.decide(u.organizationId,u.sub,id,true,d.reason)}
@Post('approvals/:id/reject') @Permissions('ai.agent.approve') reject(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ToolDecisionDto){return this.s.decide(u.organizationId,u.sub,id,false,d.reason)}}
