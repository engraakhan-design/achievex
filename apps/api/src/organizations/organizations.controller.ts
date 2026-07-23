import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';
@ApiTags('organization') @ApiBearerAuth() @Controller('organization')
export class OrganizationsController {
 constructor(private service:OrganizationsService){}
 @Get() get(@CurrentUser() u:AuthenticatedUser){return this.service.get(u.organizationId)}
 @Patch() @RequirePermissions('organization.manage') update(@CurrentUser() u:AuthenticatedUser,@Body() dto:UpdateOrganizationDto){return this.service.update(u.organizationId,u.sub,dto)}
}
