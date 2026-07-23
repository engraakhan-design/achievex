import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createHash, randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDomainDto, CreateIdentityProviderDto, CreateScimTokenDto, UpdateBrandingDto, UpdateCompliancePolicyDto, UpdateDomainDto, UpdateFeatureFlagDto, UpdateIdentityProviderDto, UpdateSecurityPolicyDto, UpsertSettingDto } from './dto/enterprise.dto';

const FLAG_CATALOG = [
  ['ai_assistant', 'AI Strategy Assistant'], ['executive_dashboard', 'Executive Dashboard'], ['realtime', 'Real-time Collaboration'],
  ['public_api', 'Public API'], ['marketplace', 'Marketplace'], ['projects', 'Projects & Initiatives'],
  ['performance_reviews', 'Performance Reviews'], ['pulse_surveys', 'Pulse Surveys'], ['beta_features', 'Beta Features'],
] as const;

@Injectable()
export class EnterpriseService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, private readonly config: ConfigService) {}

  private encryptionKey() { return createHash('sha256').update(this.config.get('TENANT_SECRET_KEY', 'development-only-change-me')).digest(); }
  private encrypt(value: string) {
    const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`;
  }
  private async storeSecret(organizationId: string, name: string, value: string) {
    await this.prisma.tenantSecret.updateMany({ where: { organizationId, name, status: 'ACTIVE' }, data: { status: 'ROTATED' } });
    return this.prisma.tenantSecret.create({ data: { organizationId, name, encryptedValue: this.encrypt(value), fingerprint: createHash('sha256').update(value).digest('hex').slice(0, 16) } });
  }

  getBranding(organizationId: string) { return this.prisma.tenantBranding.upsert({ where: { organizationId }, update: {}, create: { organizationId } }); }
  async updateBranding(organizationId: string, actorUserId: string, dto: UpdateBrandingDto) {
    const value = await this.prisma.tenantBranding.upsert({ where: { organizationId }, update: dto, create: { organizationId, ...dto } });
    await this.audit.record({ organizationId, actorUserId, action: 'tenant.branding_updated', entityType: 'TenantBranding', entityId: value.id, metadata: { fields: Object.keys(dto) } }); return value;
  }
  getSecurityPolicy(organizationId: string) { return this.prisma.securityPolicy.upsert({ where: { organizationId }, update: {}, create: { organizationId } }); }
  async updateSecurityPolicy(organizationId: string, actorUserId: string, dto: UpdateSecurityPolicyDto) {
    const value = await this.prisma.securityPolicy.upsert({ where: { organizationId }, update: dto, create: { organizationId, ...dto } });
    await this.audit.record({ organizationId, actorUserId, action: 'security.policy_changed', entityType: 'SecurityPolicy', entityId: value.id, metadata: { fields: Object.keys(dto) } }); return value;
  }
  getCompliancePolicy(organizationId: string) { return this.prisma.compliancePolicy.upsert({ where: { organizationId }, update: {}, create: { organizationId } }); }
  async updateCompliancePolicy(organizationId: string, actorUserId: string, dto: UpdateCompliancePolicyDto) {
    const value = await this.prisma.compliancePolicy.upsert({ where: { organizationId }, update: dto, create: { organizationId, ...dto } });
    await this.audit.record({ organizationId, actorUserId, action: 'compliance.policy_changed', entityType: 'CompliancePolicy', entityId: value.id, metadata: { fields: Object.keys(dto) } }); return value;
  }

  async listFlags(organizationId: string) {
    const overrides = await this.prisma.featureFlagOverride.findMany({ where: { organizationId } });
    const map = new Map(overrides.map((x) => [x.key, x]));
    return FLAG_CATALOG.map(([key, name]) => ({ key, name, enabled: map.get(key)?.enabled ?? ['executive_dashboard','realtime'].includes(key), rolloutPercentage: map.get(key)?.rolloutPercentage ?? 100, value: map.get(key)?.value ?? null }));
  }
  async updateFlag(organizationId: string, actorUserId: string, key: string, dto: UpdateFeatureFlagDto) {
    if (!FLAG_CATALOG.some(([candidate]) => candidate === key)) throw new NotFoundException('Unknown feature flag');
    const jsonValue = dto.value as Prisma.InputJsonValue | undefined;
    const update: Prisma.FeatureFlagOverrideUncheckedUpdateInput = { enabled: dto.enabled, rolloutPercentage: dto.rolloutPercentage, ...(jsonValue !== undefined ? { value: jsonValue } : {}), updatedById: actorUserId };
    const create: Prisma.FeatureFlagOverrideUncheckedCreateInput = { organizationId, key, enabled: dto.enabled, rolloutPercentage: dto.rolloutPercentage ?? 100, ...(jsonValue !== undefined ? { value: jsonValue } : {}), updatedById: actorUserId };
    const value = await this.prisma.featureFlagOverride.upsert({ where: { organizationId_key: { organizationId, key } }, update, create });
    await this.audit.record({ organizationId, actorUserId, action: dto.enabled ? 'feature.enabled' : 'feature.disabled', entityType: 'FeatureFlag', entityId: value.id, metadata: { key, rolloutPercentage: value.rolloutPercentage } }); return value;
  }

  listSettings(organizationId: string, namespace?: string) { return this.prisma.organizationSetting.findMany({ where: { organizationId, ...(namespace ? { namespace } : {}) }, orderBy: [{ namespace: 'asc' }, { key: 'asc' }] }); }
  async upsertSetting(organizationId: string, actorUserId: string, dto: UpsertSettingDto) {
    const value = await this.prisma.organizationSetting.upsert({ where: { organizationId_namespace_key: { organizationId, namespace: dto.namespace, key: dto.key } }, update: { value: dto.value as object, updatedById: actorUserId, version: { increment: 1 } }, create: { organizationId, namespace: dto.namespace, key: dto.key, value: dto.value as object, updatedById: actorUserId } });
    await this.audit.record({ organizationId, actorUserId, action: 'tenant.setting_updated', entityType: 'OrganizationSetting', entityId: value.id, metadata: { namespace: dto.namespace, key: dto.key } }); return value;
  }

  listDomains(organizationId: string) { return this.prisma.verifiedDomain.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } }); }
  async createDomain(organizationId: string, actorUserId: string, dto: CreateDomainDto) {
    const domain = dto.domain.toLowerCase(); const value = await this.prisma.verifiedDomain.create({ data: { organizationId, domain, verificationToken: `achievex-domain=${randomBytes(24).toString('hex')}`, autoJoinEnabled: dto.autoJoinEnabled ?? false, restrictInvites: dto.restrictInvites ?? false } });
    await this.audit.record({ organizationId, actorUserId, action: 'identity.domain_added', entityType: 'VerifiedDomain', entityId: value.id, metadata: { domain } }); return value;
  }
  async verifyDomain(organizationId: string, actorUserId: string, id: string) {
    const domain = await this.prisma.verifiedDomain.findFirst({ where: { id, organizationId } }); if (!domain) throw new NotFoundException('Domain not found');
    const value = await this.prisma.verifiedDomain.update({ where: { id }, data: { status: 'VERIFIED', verifiedAt: new Date() } });
    await this.audit.record({ organizationId, actorUserId, action: 'identity.domain_verified', entityType: 'VerifiedDomain', entityId: id, metadata: { domain: domain.domain, verificationMode: 'manual-development' } }); return value;
  }
  async updateDomain(organizationId: string, actorUserId: string, id: string, dto: UpdateDomainDto) {
    const found = await this.prisma.verifiedDomain.findFirst({ where: { id, organizationId } }); if (!found) throw new NotFoundException('Domain not found');
    const value = await this.prisma.verifiedDomain.update({ where: { id }, data: dto }); await this.audit.record({ organizationId, actorUserId, action: 'identity.domain_updated', entityType: 'VerifiedDomain', entityId: id }); return value;
  }

  listIdentityProviders(organizationId: string) { return this.prisma.identityProvider.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' }, select: { id:true,name:true,type:true,status:true,issuerUrl:true,metadataUrl:true,entityId:true,clientId:true,emailDomains:true,jitProvisioning:true,defaultRoleName:true,createdAt:true,updatedAt:true } }); }
  async createIdentityProvider(organizationId: string, actorUserId: string, dto: CreateIdentityProviderDto) {
    if (dto.type === 'OIDC' && !dto.issuerUrl) throw new BadRequestException('OIDC issuerUrl is required');
    if (dto.type === 'SAML' && !dto.metadataUrl && !dto.entityId) throw new BadRequestException('SAML metadataUrl or entityId is required');
    const clientSecretId = dto.clientSecret ? (await this.storeSecret(organizationId, `idp:${dto.name}:client-secret`, dto.clientSecret)).id : undefined;
    const certificateSecretId = dto.certificate ? (await this.storeSecret(organizationId, `idp:${dto.name}:certificate`, dto.certificate)).id : undefined;
    const { clientSecret, certificate, ...safe } = dto;
    const value = await this.prisma.identityProvider.create({ data: { organizationId, createdById: actorUserId, ...safe, clientSecretId, certificateSecretId } });
    await this.audit.record({ organizationId, actorUserId, action: 'identity.provider_created', entityType: 'IdentityProvider', entityId: value.id, metadata: { type: value.type } }); return value;
  }
  async updateIdentityProvider(organizationId: string, actorUserId: string, id: string, dto: UpdateIdentityProviderDto) {
    const current = await this.prisma.identityProvider.findFirst({ where: { id, organizationId } }); if (!current) throw new NotFoundException('Identity provider not found');
    const clientSecretId = dto.clientSecret ? (await this.storeSecret(organizationId, `idp:${current.name}:client-secret`, dto.clientSecret)).id : undefined;
    const certificateSecretId = dto.certificate ? (await this.storeSecret(organizationId, `idp:${current.name}:certificate`, dto.certificate)).id : undefined;
    const { clientSecret, certificate, ...safe } = dto;
    const value = await this.prisma.identityProvider.update({ where: { id }, data: { ...safe, ...(clientSecretId ? { clientSecretId } : {}), ...(certificateSecretId ? { certificateSecretId } : {}) } });
    await this.audit.record({ organizationId, actorUserId, action: 'identity.provider_updated', entityType: 'IdentityProvider', entityId: id, metadata: { status: value.status } }); return value;
  }

  async listSessions(organizationId: string) { return this.prisma.userSession.findMany({ where: { organizationId }, orderBy: { lastActivityAt: 'desc' }, include: { user: { select: { id:true,email:true,firstName:true,lastName:true } } } }); }
  async revokeSession(organizationId: string, actorUserId: string, id: string) {
    const session = await this.prisma.userSession.findFirst({ where: { id, organizationId } }); if (!session) throw new NotFoundException('Session not found');
    const value = await this.prisma.userSession.update({ where: { id }, data: { status: 'REVOKED', revokedAt: new Date(), revokedById: actorUserId } });
    await this.prisma.user.update({ where: { id: session.userId }, data: { tokenVersion: { increment: 1 } } });
    await this.prisma.authToken.updateMany({ where: { userId: session.userId, revokedAt: null }, data: { revokedAt: new Date() } });
    await this.audit.record({ organizationId, actorUserId, action: 'security.session_revoked', entityType: 'UserSession', entityId: id, metadata: { userId: session.userId } }); return value;
  }
  async revokeAllSessions(organizationId: string, actorUserId: string) {
    const users = await this.prisma.user.findMany({ where: { organizationId }, select: { id: true } });
    await this.prisma.$transaction([
      this.prisma.userSession.updateMany({ where: { organizationId, status: 'ACTIVE' }, data: { status: 'REVOKED', revokedAt: new Date(), revokedById: actorUserId } }),
      this.prisma.authToken.updateMany({ where: { organizationId, revokedAt: null }, data: { revokedAt: new Date() } }),
      ...users.map((u) => this.prisma.user.update({ where: { id: u.id }, data: { tokenVersion: { increment: 1 } } })),
    ]);
    await this.audit.record({ organizationId, actorUserId, action: 'security.all_sessions_revoked', entityType: 'Organization', entityId: organizationId, metadata: { userCount: users.length } }); return { revokedUsers: users.length };
  }

  listScimTokens(organizationId: string) { return this.prisma.scimToken.findMany({ where: { organizationId }, select: { id:true,name:true,prefix:true,lastUsedAt:true,expiresAt:true,revokedAt:true,createdAt:true }, orderBy: { createdAt: 'desc' } }); }
  async createScimToken(organizationId: string, actorUserId: string, dto: CreateScimTokenDto) {
    const raw = `ax_scim_${randomBytes(32).toString('base64url')}`; const prefix = raw.slice(0, 16);
    const value = await this.prisma.scimToken.create({ data: { organizationId, createdById: actorUserId, name: dto.name, prefix, tokenHash: createHash('sha256').update(raw).digest('hex'), expiresAt: dto.expiresInDays ? new Date(Date.now() + dto.expiresInDays * 86400000) : undefined } });
    await this.audit.record({ organizationId, actorUserId, action: 'scim.token_created', entityType: 'ScimToken', entityId: value.id }); return { ...value, token: raw };
  }
  async revokeScimToken(organizationId: string, actorUserId: string, id: string) { const value = await this.prisma.scimToken.updateMany({ where: { id, organizationId }, data: { revokedAt: new Date() } }); if (!value.count) throw new NotFoundException('SCIM token not found'); await this.audit.record({ organizationId, actorUserId, action: 'scim.token_revoked', entityType: 'ScimToken', entityId: id }); return { success: true }; }

  listAudit(organizationId: string, limit = 100) { return this.prisma.auditLog.findMany({ where: { organizationId }, take: Math.min(limit, 500), orderBy: { createdAt: 'desc' }, include: { actor: { select: { email:true,firstName:true,lastName:true } } } }); }
}
