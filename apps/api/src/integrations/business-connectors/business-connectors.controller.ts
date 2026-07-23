import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../auth/auth.types';
import { BusinessConnectorsService } from './business-connectors.service';
@ApiTags('Business Connectors') @ApiBearerAuth() @Controller('integrations/business-connectors') export class BusinessConnectorsController {constructor(private service:BusinessConnectorsService){}
 @Get('catalog') @Permissions('connector.read') catalog(){return this.service.catalog()}
 @Get() @Permissions('connector.read') list(@CurrentUser()u:AuthenticatedUser){return this.service.profiles(u.organizationId)}
 @Post() @Permissions('connector.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:any){return this.service.create(u.organizationId,d)}
 @Post(':id/mappings') @Permissions('connector.manage') mappings(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.mappings(u.organizationId,id,d)}
 @Post(':id/preview') @Permissions('connector.execute') preview(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.preview(u.organizationId,id,d)}
 @Post(':id/sync') @Permissions('connector.execute') sync(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:any){return this.service.sync(u.organizationId,id,d)}
 @Get(':id/conflicts') @Permissions('connector.read') conflicts(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.conflicts(u.organizationId,id)}
 @Post(':id/conflicts/:conflictId/resolve') @Permissions('connector.resolve') resolve(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('conflictId')c:string,@Body()d:any){return this.service.resolve(u.organizationId,id,c,{...d,userId:u.sub})}
}
