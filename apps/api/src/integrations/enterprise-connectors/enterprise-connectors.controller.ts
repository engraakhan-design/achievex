import {Body,Controller,Get,Param,Post} from '@nestjs/common';
import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';
import {CurrentUser} from '../../auth/decorators/current-user.decorator';
import {Permissions} from '../../auth/decorators/permissions.decorator';
import {AuthenticatedUser} from '../../auth/auth.types';
import {EnterpriseConnectorsService} from './enterprise-connectors.service';
@ApiTags('HRIS and Collaboration Connectors') @ApiBearerAuth() @Controller('integrations/enterprise-connectors') export class EnterpriseConnectorsController {constructor(private service:EnterpriseConnectorsService){}
 @Get('catalog') @Permissions('enterprise.connector.read') catalog(){return this.service.catalog()}
 @Get() @Permissions('enterprise.connector.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.list(u.organizationId)}
 @Post() @Permissions('enterprise.connector.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:any){return this.service.create(u.organizationId,d)}
 @Post(':id/mappings') @Permissions('enterprise.connector.manage') mappings(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.replaceMappings(u.organizationId,id,d)}
 @Post(':id/preview') @Permissions('enterprise.connector.execute') preview(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.preview(u.organizationId,id,d)}
 @Post(':id/sync') @Permissions('enterprise.connector.execute') sync(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.sync(u.organizationId,id,d)}
 @Post(':id/deliveries') @Permissions('collaboration.deliver') deliver(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.deliver(u.organizationId,id,d)}
 @Get(':id/deliveries') @Permissions('enterprise.connector.read') deliveries(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.deliveries(u.organizationId,id)}
}
