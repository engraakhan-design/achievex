import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types';
import { RuleService } from './rule.service'; import { CreateRuleDefinitionDto, CreateRuleVersionDto, EvaluateRuleDto } from './dto/rule.dto';
@Controller('workflow/rules') export class RuleController { constructor(private readonly service:RuleService){}
@Get() @RequirePermissions('rule.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.list(u.organizationId)}
@Post() @RequirePermissions('rule.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateRuleDefinitionDto){return this.service.create(u.organizationId,u.sub,d)}
@Post(':id/versions') @RequirePermissions('rule.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateRuleVersionDto){return this.service.addVersion(u.organizationId,u.sub,id,d)}
@Post(':id/versions/:versionId/publish') @RequirePermissions('rule.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('versionId')versionId:string){return this.service.publish(u.organizationId,id,versionId)}
@Post(':id/evaluate') @RequirePermissions('rule.execute') evaluate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:EvaluateRuleDto){return this.service.evaluate(u.organizationId,u.sub,id,d)}
@Get('executions/history') @RequirePermissions('rule.read') history(@CurrentUser()u:AuthenticatedUser,@Query('definitionId')id?:string){return this.service.history(u.organizationId,id)} }
