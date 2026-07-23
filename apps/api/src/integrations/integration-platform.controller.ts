import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { IntegrationPlatformService } from './integration-platform.service';
@ApiTags('Enterprise Integrations') @ApiBearerAuth() @Controller('integrations/platform') export class IntegrationPlatformController {constructor(private service:IntegrationPlatformService){}
 @Get('catalog') @Permissions('integration.read') catalog(@CurrentUser()u:AuthenticatedUser){return this.service.catalog(u.organizationId)}
 @Get() @Permissions('integration.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.instances(u.organizationId)}
 @Post() @Permissions('integration.manage') install(@CurrentUser()u:AuthenticatedUser,@Body()d:any){return this.service.install(u.organizationId,d)}
 @Get('monitor') @Permissions('eventbus.monitor') monitor(@CurrentUser()u:AuthenticatedUser){return this.service.monitor(u.organizationId)}
 @Get('executions') @Permissions('eventbus.monitor') executions(@CurrentUser()u:AuthenticatedUser){return this.service.executions(u.organizationId)}
 @Get(':id') @Permissions('integration.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.detail(u.organizationId,id)}
 @Post(':id/credentials') @Permissions('integration.credentials.manage') credential(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.credential(u.organizationId,id,d)}
 @Post(':id/test') @Permissions('integration.execute') test(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.execute(u.organizationId,id,'TEST_CONNECTION')}
 @Post(':id/sync') @Permissions('integration.execute') sync(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.execute(u.organizationId,id,'SYNC',d)}
 @Get(':id/health') @Permissions('integration.read') health(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.health(u.organizationId,id)}
}
