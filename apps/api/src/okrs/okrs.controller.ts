import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { AddCommentDto, AlignObjectiveDto, CheckInDto, CreateCycleDto, CreateInitiativeDto, CreateKeyResultDto, CreateObjectiveDto, ListObjectivesQuery, UpdateCycleDto, UpdateInitiativeDto, UpdateKeyResultDto, UpdateObjectiveDto } from './dto/okrs.dto';
import { OkrsService } from './okrs.service';
@ApiTags('okrs') @ApiBearerAuth() @Controller('okrs')
export class OkrsController {
  constructor(private readonly s: OkrsService) {}
  @Get('dashboard') @RequirePermissions('okrs.read') dashboard(@CurrentUser() u:AuthenticatedUser,@Query('cycleId') cycleId?:string){return this.s.dashboard(u.organizationId,cycleId)}
  @Get('cycles') @RequirePermissions('okrs.read') cycles(@CurrentUser()u:AuthenticatedUser){return this.s.listCycles(u.organizationId)}
  @Post('cycles') @RequirePermissions('okrs.manage') createCycle(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateCycleDto){return this.s.createCycle(u.organizationId,u.sub,d)}
  @Patch('cycles/:id') @RequirePermissions('okrs.manage') updateCycle(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateCycleDto){return this.s.updateCycle(u.organizationId,id,u.sub,d)}
  @Get('objectives') @RequirePermissions('okrs.read') list(@CurrentUser()u:AuthenticatedUser,@Query()q:ListObjectivesQuery){return this.s.listObjectives(u.organizationId,q)}
  @Post('objectives') @RequirePermissions('okrs.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateObjectiveDto){return this.s.createObjective(u.organizationId,u.sub,d)}
  @Get('objectives/:id') @RequirePermissions('okrs.read') get(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.getObjective(u.organizationId,id)}
  @Patch('objectives/:id') @RequirePermissions('okrs.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateObjectiveDto){return this.s.updateObjective(u.organizationId,id,u.sub,d)}
  @Put('objectives/:id/alignment') @RequirePermissions('okrs.manage') align(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AlignObjectiveDto){return this.s.alignObjective(u.organizationId,id,u.sub,d)}
  @Delete('objectives/:id') @RequirePermissions('okrs.manage') remove(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.deleteObjective(u.organizationId,id,u.sub)}
  @Post('objectives/:id/key-results') @RequirePermissions('okrs.manage') createKr(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateKeyResultDto){return this.s.createKeyResult(u.organizationId,id,u.sub,d)}
  @Patch('key-results/:id') @RequirePermissions('okrs.manage') updateKr(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateKeyResultDto){return this.s.updateKeyResult(u.organizationId,id,u.sub,d)}
  @Post('key-results/:id/check-ins') @RequirePermissions('okrs.manage') checkIn(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CheckInDto){return this.s.checkIn(u.organizationId,id,u.sub,d)}
  @Delete('key-results/:id') @RequirePermissions('okrs.manage') deleteKr(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.deleteKeyResult(u.organizationId,id,u.sub)}
  @Post('key-results/:id/initiatives') @RequirePermissions('okrs.manage') initiative(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateInitiativeDto){return this.s.createInitiative(u.organizationId,id,u.sub,d)}
  @Patch('initiatives/:id') @RequirePermissions('okrs.manage') updateInitiative(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateInitiativeDto){return this.s.updateInitiative(u.organizationId,id,u.sub,d)}
  @Post('objectives/:id/comments') @RequirePermissions('okrs.manage') comment(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddCommentDto){return this.s.addComment(u.organizationId,id,u.sub,d)}
}
