import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CreateDomainDto, CreateIdentityProviderDto, CreateScimTokenDto, UpdateBrandingDto, UpdateCompliancePolicyDto, UpdateDomainDto, UpdateFeatureFlagDto, UpdateIdentityProviderDto, UpdateSecurityPolicyDto, UpsertSettingDto } from './dto/enterprise.dto';
import { EnterpriseService } from './enterprise.service';

@ApiTags('enterprise administration') @ApiBearerAuth() @Controller('enterprise') @RequirePermissions('organization.manage')
export class EnterpriseController {
  constructor(private readonly service: EnterpriseService) {}
  @Get('branding') branding(@CurrentUser() u:AuthenticatedUser){ return this.service.getBranding(u.organizationId); }
  @Patch('branding') updateBranding(@CurrentUser() u:AuthenticatedUser,@Body() dto:UpdateBrandingDto){ return this.service.updateBranding(u.organizationId,u.sub,dto); }
  @Get('security-policy') security(@CurrentUser() u:AuthenticatedUser){ return this.service.getSecurityPolicy(u.organizationId); }
  @Patch('security-policy') updateSecurity(@CurrentUser() u:AuthenticatedUser,@Body() dto:UpdateSecurityPolicyDto){ return this.service.updateSecurityPolicy(u.organizationId,u.sub,dto); }
  @Get('compliance') compliance(@CurrentUser() u:AuthenticatedUser){ return this.service.getCompliancePolicy(u.organizationId); }
  @Patch('compliance') updateCompliance(@CurrentUser() u:AuthenticatedUser,@Body() dto:UpdateCompliancePolicyDto){ return this.service.updateCompliancePolicy(u.organizationId,u.sub,dto); }
  @Get('feature-flags') flags(@CurrentUser() u:AuthenticatedUser){ return this.service.listFlags(u.organizationId); }
  @Patch('feature-flags/:key') updateFlag(@CurrentUser() u:AuthenticatedUser,@Param('key') key:string,@Body() dto:UpdateFeatureFlagDto){ return this.service.updateFlag(u.organizationId,u.sub,key,dto); }
  @Get('settings') settings(@CurrentUser() u:AuthenticatedUser,@Query('namespace') namespace?:string){ return this.service.listSettings(u.organizationId,namespace); }
  @Post('settings') upsertSetting(@CurrentUser() u:AuthenticatedUser,@Body() dto:UpsertSettingDto){ return this.service.upsertSetting(u.organizationId,u.sub,dto); }
  @Get('domains') domains(@CurrentUser() u:AuthenticatedUser){ return this.service.listDomains(u.organizationId); }
  @Post('domains') createDomain(@CurrentUser() u:AuthenticatedUser,@Body() dto:CreateDomainDto){ return this.service.createDomain(u.organizationId,u.sub,dto); }
  @Post('domains/:id/verify') verifyDomain(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){ return this.service.verifyDomain(u.organizationId,u.sub,id); }
  @Patch('domains/:id') updateDomain(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() dto:UpdateDomainDto){ return this.service.updateDomain(u.organizationId,u.sub,id,dto); }
  @Get('identity-providers') providers(@CurrentUser() u:AuthenticatedUser){ return this.service.listIdentityProviders(u.organizationId); }
  @Post('identity-providers') createProvider(@CurrentUser() u:AuthenticatedUser,@Body() dto:CreateIdentityProviderDto){ return this.service.createIdentityProvider(u.organizationId,u.sub,dto); }
  @Patch('identity-providers/:id') updateProvider(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string,@Body() dto:UpdateIdentityProviderDto){ return this.service.updateIdentityProvider(u.organizationId,u.sub,id,dto); }
  @Get('sessions') sessions(@CurrentUser() u:AuthenticatedUser){ return this.service.listSessions(u.organizationId); }
  @Delete('sessions/:id') revokeSession(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){ return this.service.revokeSession(u.organizationId,u.sub,id); }
  @Post('sessions/revoke-all') revokeAll(@CurrentUser() u:AuthenticatedUser){ return this.service.revokeAllSessions(u.organizationId,u.sub); }
  @Get('scim-tokens') scimTokens(@CurrentUser() u:AuthenticatedUser){ return this.service.listScimTokens(u.organizationId); }
  @Post('scim-tokens') createScimToken(@CurrentUser() u:AuthenticatedUser,@Body() dto:CreateScimTokenDto){ return this.service.createScimToken(u.organizationId,u.sub,dto); }
  @Delete('scim-tokens/:id') revokeScimToken(@CurrentUser() u:AuthenticatedUser,@Param('id') id:string){ return this.service.revokeScimToken(u.organizationId,u.sub,id); }
  @Get('audit') audit(@CurrentUser() u:AuthenticatedUser,@Query('limit') limit?:string){ return this.service.listAudit(u.organizationId,Number(limit ?? 100)); }
}
