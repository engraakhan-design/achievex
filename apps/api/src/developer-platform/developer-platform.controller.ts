import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { DeveloperPlatformService } from './developer-platform.service';
import { CreateApiApplicationDto, CreateApiProductDto, GenerateSdkDto, PublishApiVersionDto, RecordUsageDto, RotateApiCredentialDto } from './dto';

@ApiTags('Developer Platform') @ApiBearerAuth() @Controller('developer-platform')
export class DeveloperPlatformController {
  constructor(private readonly service: DeveloperPlatformService) {}
  @Get('overview') @Permissions('api.platform.read') overview(@CurrentUser() u:AuthenticatedUser){return this.service.overview(u.organizationId)}
  @Get('openapi') @Permissions('api.platform.read') openApi(){return this.service.openApiManifest()}
  @Get('graphql/schema') @Permissions('api.platform.read') graphQlSchema(){return this.service.graphQlSchema()}
  @Get('applications') @Permissions('api.application.read') applications(@CurrentUser() u:AuthenticatedUser){return this.service.applications(u.organizationId)}
  @Post('applications') @Permissions('api.application.manage') createApplication(@CurrentUser() u:AuthenticatedUser,@Body() d:CreateApiApplicationDto){return this.service.createApplication(u.organizationId,d)}
  @Post('applications/:id/credentials') @Permissions('api.credential.manage') credential(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:RotateApiCredentialDto){return this.service.issueCredential(u.organizationId,id,d)}
  @Post('applications/:id/revoke') @Permissions('api.credential.manage') revoke(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){return this.service.revokeCredentials(u.organizationId,id)}
  @Get('products') @Permissions('api.platform.read') products(@CurrentUser() u:AuthenticatedUser){return this.service.products(u.organizationId)}
  @Post('products') @Permissions('api.platform.manage') createProduct(@CurrentUser() u:AuthenticatedUser,@Body() d:CreateApiProductDto){return this.service.createProduct(u.organizationId,d)}
  @Post('products/:id/versions') @Permissions('api.platform.manage') publishVersion(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() d:PublishApiVersionDto){return this.service.publishVersion(u.organizationId,id,d)}
  @Get('usage') @Permissions('api.analytics.read') usage(@CurrentUser() u:AuthenticatedUser,@Query('days') days?:string){return this.service.usage(u.organizationId,Math.min(90,Math.max(1,Number(days)||30)))}
  @Post('usage') @Permissions('api.analytics.record') record(@CurrentUser() u:AuthenticatedUser,@Body() d:RecordUsageDto){return this.service.recordUsage(u.organizationId,d)}
  @Post('sdk/generate') @Permissions('api.sdk.generate') sdk(@Body() d:GenerateSdkDto){return this.service.generateSdk(d)}
  @Get('marketplace') @Permissions('api.marketplace.read') marketplace(@CurrentUser() u:AuthenticatedUser){return this.service.marketplace(u.organizationId)}
}
