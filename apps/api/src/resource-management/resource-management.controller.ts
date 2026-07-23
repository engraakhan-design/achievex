import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';import { RequirePermissions } from '../auth/decorators/permissions.decorator';import { AuthenticatedUser } from '../auth/auth.types';
import { ResourceManagementService } from './resource-management.service';import { AddTeamMemberDto, AssignSkillDto, CapacityQueryDto, CreateAllocationDto, CreateAvailabilityExceptionDto, CreateHolidayCalendarDto, CreateResourceDto, CreateResourceTeamDto, CreateSkillDto, CreateWorkingCalendarDto, UpdateResourceDto, UpdateWorkingCalendarDto, ScheduleQueryDto, RescheduleAllocationDto, PreviewScheduleScenarioDto, WorkforceAnalyticsQueryDto } from './dto/resource-management.dto';
@Controller('resource-management') export class ResourceManagementController{constructor(private service:ResourceManagementService){}
@Get('overview') @RequirePermissions('resources.read') overview(@CurrentUser()u:AuthenticatedUser){return this.service.overview(u.organizationId)}
@Get('resources') @RequirePermissions('resources.read') resources(@CurrentUser()u:AuthenticatedUser){return this.service.listResources(u.organizationId)}
@Post('resources') @RequirePermissions('resources.manage') createResource(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateResourceDto){return this.service.createResource(u.organizationId,u.sub,d)}
@Patch('resources/:id') @RequirePermissions('resources.manage') updateResource(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateResourceDto){return this.service.updateResource(u.organizationId,u.sub,id,d)}
@Get('teams') @RequirePermissions('resources.read') teams(@CurrentUser()u:AuthenticatedUser){return this.service.listTeams(u.organizationId)}
@Post('teams') @RequirePermissions('resources.manage') createTeam(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateResourceTeamDto){return this.service.createTeam(u.organizationId,u.sub,d)}
@Post('teams/:id/members') @RequirePermissions('resources.manage') addMember(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddTeamMemberDto){return this.service.addTeamMember(u.organizationId,u.sub,id,d)}
@Get('skills') @RequirePermissions('resources.read') skills(@CurrentUser()u:AuthenticatedUser){return this.service.listSkills(u.organizationId)}
@Post('skills') @RequirePermissions('resources.manage') createSkill(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateSkillDto){return this.service.createSkill(u.organizationId,u.sub,d)}
@Post('resources/:id/skills') @RequirePermissions('resources.manage') assignSkill(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AssignSkillDto){return this.service.assignSkill(u.organizationId,u.sub,id,d)}
@Get('allocations') @RequirePermissions('resources.read') allocations(@CurrentUser()u:AuthenticatedUser){return this.service.listAllocations(u.organizationId)}
@Post('allocations') @RequirePermissions('resources.manage') createAllocation(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAllocationDto){return this.service.createAllocation(u.organizationId,u.sub,d)}
@Get('calendars') @RequirePermissions('resources.read') calendars(@CurrentUser()u:AuthenticatedUser){return this.service.listCalendars(u.organizationId)}
@Post('calendars') @RequirePermissions('resources.manage') createCalendar(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateWorkingCalendarDto){return this.service.createCalendar(u.organizationId,u.sub,d)}
@Get('schedule') @RequirePermissions('resources.read') schedule(@CurrentUser()u:AuthenticatedUser,@Query()q:ScheduleQueryDto){return this.service.schedule(u.organizationId,q)}
@Patch('allocations/:id/schedule') @RequirePermissions('resources.manage') reschedule(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:RescheduleAllocationDto){return this.service.rescheduleAllocation(u.organizationId,u.sub,id,d)}
@Post('schedule/scenarios/preview') @RequirePermissions('resources.manage') preview(@CurrentUser()u:AuthenticatedUser,@Body()d:PreviewScheduleScenarioDto){return this.service.previewScheduleScenario(u.organizationId,d)}
@Get('capacity') @RequirePermissions('resources.read') capacity(@CurrentUser()u:AuthenticatedUser,@Query()q:CapacityQueryDto){return this.service.capacityPlan(u.organizationId,q)}
@Get('capacity/conflicts') @RequirePermissions('resources.read') conflicts(@CurrentUser()u:AuthenticatedUser,@Query()q:CapacityQueryDto){return this.service.allocationConflicts(u.organizationId,q)}
@Get('holiday-calendars') @RequirePermissions('resources.read') holidayCalendars(@CurrentUser()u:AuthenticatedUser){return this.service.listHolidayCalendars(u.organizationId)}
@Post('holiday-calendars') @RequirePermissions('resources.manage') createHolidayCalendar(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateHolidayCalendarDto){return this.service.createHolidayCalendar(u.organizationId,u.sub,d)}
@Patch('calendars/:id') @RequirePermissions('resources.manage') updateCalendar(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateWorkingCalendarDto){return this.service.updateCalendar(u.organizationId,u.sub,id,d)}
@Post('resources/:id/availability-exceptions') @RequirePermissions('resources.manage') availability(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateAvailabilityExceptionDto){return this.service.addAvailabilityException(u.organizationId,u.sub,id,d)}
@Get('analytics/workforce') @RequirePermissions('resources.read') workforce(@CurrentUser()u:AuthenticatedUser,@Query()q:WorkforceAnalyticsQueryDto){return this.service.workforceAnalytics(u.organizationId,q)}
@Get('analytics/executive-report') @RequirePermissions('resources.read') executiveReport(@CurrentUser()u:AuthenticatedUser,@Query()q:WorkforceAnalyticsQueryDto){return this.service.workforceExecutiveReport(u.organizationId,q)}

}
