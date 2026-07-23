import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateAccessGrantDto, CreateDeveloperApplicationDto, CreateDeveloperCredentialDto, CreateRateLimitPolicyDto, UpdateDeveloperApplicationDto } from './dto-v1';
import { DeveloperPlatformV1Service } from './developer-platform-v1.service';

@ApiTags('Developer Platform v1') @ApiBearerAuth() @Controller('v1/developer')
export class DeveloperPlatformV1Controller {
 constructor(private readonly service:DeveloperPlatformV1Service){}
 @Get('applications') @Permissions('developer.application.read') applications(@CurrentUser() u:AuthenticatedUser){return this.service.listApplications(u.organizationId)}
 @Post('applications') @Permissions('developer.application.manage') create(@CurrentUser() u:AuthenticatedUser,@Body() d:CreateDeveloperApplicationDto){return this.service.createApplication(u.organizationId,u.sub,d)}
 @Get('applications/:id') @Permissions('developer.application.read') get(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.service.getApplication(u.organizationId,id)}
 @Patch('applications/:id') @Permissions('developer.application.manage') update(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:UpdateDeveloperApplicationDto){return this.service.updateApplication(u.organizationId,id,d)}
 @Post('applications/:id/credentials') @Permissions('developer.credential.manage') credential(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:CreateDeveloperCredentialDto){return this.service.issueCredential(u.organizationId,id,d)}
 @Post('credentials/:id/rotate') @Permissions('developer.credential.manage') rotate(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.service.rotateCredential(u.organizationId,id)}
 @Post('credentials/:id/revoke') @Permissions('developer.credential.manage') revoke(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.service.revokeCredential(u.organizationId,id)}
 @Post('applications/:id/grants') @Permissions('developer.scope.manage') grant(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:CreateAccessGrantDto){return this.service.grant(u.organizationId,id,d)}
 @Post('grants/:id/revoke') @Permissions('developer.scope.manage') revokeGrant(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.service.revokeGrant(u.organizationId,id)}
 @Get('scopes') @Permissions('developer.scope.read') scopes(){return this.service.ensureScopeCatalog()}
 @Get('rate-limits') @Permissions('developer.application.read') policies(@CurrentUser() u:AuthenticatedUser){return this.service.policies(u.organizationId)}
 @Post('rate-limits') @Permissions('developer.application.manage') policy(@CurrentUser() u:AuthenticatedUser,@Body() d:CreateRateLimitPolicyDto){return this.service.createPolicy(u.organizationId,d)}
 @Get('usage') @Permissions('developer.usage.read') usage(@CurrentUser() u:AuthenticatedUser,@Query('days') days?:string){return this.service.usage(u.organizationId,Number(days)||30)}
 @Get('request-logs') @Permissions('developer.audit.read') logs(@CurrentUser() u:AuthenticatedUser,@Query('take') take?:string){return this.service.logs(u.organizationId,Number(take)||100)}
 @Get('openapi') @Permissions('developer.scope.read') manifest(){return this.service.manifest()}
}
