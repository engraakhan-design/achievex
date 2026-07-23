import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CompleteWorkflowTaskDto, CreateWorkflowDefinitionDto, SaveWorkflowVersionDto, StartWorkflowDto } from './dto/workflow.dto';
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly service:WorkflowService){}
  @Get('definitions') @RequirePermissions('workflow.read') definitions(@CurrentUser()u:AuthenticatedUser){return this.service.listDefinitions(u.organizationId)}
  @Post('definitions') @RequirePermissions('workflow.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateWorkflowDefinitionDto){return this.service.createDefinition(u.organizationId,u.sub,d)}
  @Post('definitions/:id/versions') @RequirePermissions('workflow.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:SaveWorkflowVersionDto){return this.service.saveVersion(u.organizationId,u.sub,id,d)}
  @Post('definitions/:id/publish') @RequirePermissions('workflow.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.publish(u.organizationId,u.sub,id)}
  @Get('instances') @RequirePermissions('workflow.read') instances(@CurrentUser()u:AuthenticatedUser){return this.service.listInstances(u.organizationId)}
  @Post('instances') @RequirePermissions('workflow.execute') start(@CurrentUser()u:AuthenticatedUser,@Body()d:StartWorkflowDto){return this.service.start(u.organizationId,u.sub,d)}
  @Get('instances/:id') @RequirePermissions('workflow.read') instance(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.getInstance(u.organizationId,id)}
  @Post('tasks/:id/complete') @RequirePermissions('workflow.execute') complete(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CompleteWorkflowTaskDto){return this.service.completeTask(u.organizationId,u.sub,id,d)}
  @Get('history/:instanceId') @RequirePermissions('workflow.read') history(@CurrentUser()u:AuthenticatedUser,@Param('instanceId')id:string){return this.service.history(u.organizationId,id)}
}
