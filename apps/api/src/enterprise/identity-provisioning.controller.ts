import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { CreateDirectoryConnectionDto, PreviewDirectorySyncDto, UpdateDirectoryConnectionDto, UpsertAttributeMappingsDto } from './dto/identity-provisioning.dto';
import { IdentityProvisioningService } from './identity-provisioning.service';
@ApiTags('identity provisioning') @ApiBearerAuth() @Controller('identity/provisioning')
export class IdentityProvisioningController {constructor(private readonly service:IdentityProvisioningService){}
 @Get('connections') @Permissions('identity.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.list(u.organizationId)}
 @Post('connections') @Permissions('identity.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateDirectoryConnectionDto){return this.service.create(u.organizationId,u.sub,d)}
 @Get('connections/:id') @Permissions('identity.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.detail(u.organizationId,id)}
 @Patch('connections/:id') @Permissions('identity.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateDirectoryConnectionDto){return this.service.update(u.organizationId,u.sub,id,d)}
 @Post('connections/:id/mappings') @Permissions('identity.manage') mappings(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpsertAttributeMappingsDto){return this.service.mappings(u.organizationId,u.sub,id,d)}
 @Post('connections/:id/preview') @Permissions('identity.execute') preview(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:PreviewDirectorySyncDto){return this.service.preview(u.organizationId,id,d)}
 @Post('connections/:id/sync') @Permissions('identity.execute') run(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:PreviewDirectorySyncDto){return this.service.run(u.organizationId,u.sub,id,d)}
 @Get('runs') @Permissions('identity.read') runs(@CurrentUser()u:AuthenticatedUser,@Query('connectionId')id?:string){return this.service.runs(u.organizationId,id)}
 @Get('events') @Permissions('identity.read') events(@CurrentUser()u:AuthenticatedUser,@Query('connectionId')id?:string){return this.service.events(u.organizationId,id)}
}
