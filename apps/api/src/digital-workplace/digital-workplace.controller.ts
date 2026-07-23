import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { RequirePermissions as Permissions } from '../auth/decorators/permissions.decorator';
import { AcknowledgeAnnouncementDto, CreateCommunicationCampaignDto, CreateEnterpriseAnnouncementDto, UpdateEnterpriseAnnouncementDto, UpdateWorkplacePreferenceDto } from './dto'; import { DigitalWorkplaceService } from './digital-workplace.service';
@ApiTags('Enterprise Digital Workplace') @ApiBearerAuth() @Controller('workplace') export class DigitalWorkplaceController {constructor(private readonly s:DigitalWorkplaceService){}
 @Get('home') @Permissions('workplace.read') home(@CurrentUser()u:AuthenticatedUser){return this.s.home(u.organizationId,u)}
 @Get('directory') @Permissions('directory.read') directory(@CurrentUser()u:AuthenticatedUser,@Query('q')q?:string){return this.s.directory(u.organizationId,q)}
 @Get('announcements') @Permissions('announcement.read') announcements(@CurrentUser()u:AuthenticatedUser){return this.s.listAnnouncements(u.organizationId,u)}
 @Post('announcements') @Permissions('announcement.manage') createAnnouncement(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateEnterpriseAnnouncementDto){return this.s.createAnnouncement(u.organizationId,u.sub,d)}
 @Patch('announcements/:id') @Permissions('announcement.manage') updateAnnouncement(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateEnterpriseAnnouncementDto){return this.s.updateAnnouncement(u.organizationId,id,d)}
 @Post('announcements/:id/acknowledge') @Permissions('announcement.read') acknowledge(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AcknowledgeAnnouncementDto){return this.s.acknowledge(u.organizationId,u.sub,id,d)}
 @Get('campaigns') @Permissions('communication.manage') campaigns(@CurrentUser()u:AuthenticatedUser){return this.s.campaigns(u.organizationId)}
 @Post('campaigns') @Permissions('communication.manage') createCampaign(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateCommunicationCampaignDto){return this.s.createCampaign(u.organizationId,u.sub,d)}
 @Post('campaigns/:id/send') @Permissions('communication.publish') send(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.publishCampaign(u.organizationId,id,u.sub)}
 @Patch('preferences') @Permissions('workplace.read') preferences(@CurrentUser()u:AuthenticatedUser,@Body()d:UpdateWorkplacePreferenceDto){return this.s.preferences(u.organizationId,u.sub,d)}
 @Get('analytics') @Permissions('communication.analytics') analytics(@CurrentUser()u:AuthenticatedUser){return this.s.analytics(u.organizationId)}
}
