import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types';
import { AutomationService } from './automation.service'; import { CreateAutomationDto, CreateAutomationVersionDto, ExecuteAutomationDto } from './dto/automation.dto';
@Controller('workflow/automations') export class AutomationController { constructor(private readonly service:AutomationService){}
@Get() @RequirePermissions('automation.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.list(u.organizationId)}
@Post() @RequirePermissions('automation.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAutomationDto){return this.service.create(u.organizationId,u.sub,d)}
@Post(':id/versions') @RequirePermissions('automation.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateAutomationVersionDto){return this.service.addVersion(u.organizationId,u.sub,id,d)}
@Post(':id/versions/:versionId/publish') @RequirePermissions('automation.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('versionId')v:string){return this.service.publish(u.organizationId,id,v)}
@Post(':id/execute') @RequirePermissions('automation.execute') execute(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ExecuteAutomationDto){return this.service.execute(u.organizationId,u.sub,id,d)}
@Post(':id/pause') @RequirePermissions('automation.manage') pause(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.pause(u.organizationId,id)}
@Get('executions/history') @RequirePermissions('automation.read') history(@CurrentUser()u:AuthenticatedUser,@Query('definitionId')id?:string){return this.service.history(u.organizationId,id)} }
