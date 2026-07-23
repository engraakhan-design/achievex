import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { Permissions } from '../auth/decorators/permissions.decorator';
import { DocumentAuthoringService } from './document-authoring.service'; import { CreateDocumentDto, CreateDocumentVersionDto, PublishDocumentDto, RequestReviewDto, ReviewDecisionDto, UpdateDocumentDto } from './dto';
@ApiTags('Enterprise Documents') @ApiBearerAuth() @Controller('documents')
export class DocumentAuthoringController {constructor(private readonly s:DocumentAuthoringService){}
@Get() @Permissions('document.read') list(@CurrentUser()u:AuthenticatedUser){return this.s.list(u.organizationId,u.sub)}
@Post() @Permissions('document.create') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateDocumentDto){return this.s.create(u.organizationId,u.sub,d)}
@Get(':id') @Permissions('document.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.detail(u.organizationId,u.sub,id)}
@Patch(':id') @Permissions('document.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateDocumentDto){return this.s.update(u.organizationId,u.sub,id,d)}
@Post(':id/versions') @Permissions('document.edit') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateDocumentVersionDto){return this.s.createVersion(u.organizationId,u.sub,id,d)}
@Post(':id/reviews') @Permissions('document.review.request') review(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:RequestReviewDto){return this.s.requestReview(u.organizationId,u.sub,id,d)}
@Post('reviews/:id/decision') @Permissions('document.review') decide(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ReviewDecisionDto){return this.s.decide(u.organizationId,u.sub,id,d)}
@Post(':id/publish') @Permissions('document.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:PublishDocumentDto){return this.s.publish(u.organizationId,u.sub,id,d)}
@Post(':id/archive') @Permissions('document.manage') archive(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.s.archive(u.organizationId,u.sub,id)} }
