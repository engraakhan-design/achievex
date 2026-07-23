import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { InviteUserDto } from './dto/invite.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';

const PERMISSIONS = ['organization.manage','users.read','users.invite','users.manage','roles.read','roles.manage','okrs.read','okrs.manage','integrations.manage','execution.read','execution.manage','resources.read','resources.manage','workflow.read','workflow.manage','workflow.publish','workflow.execute','approval.read','approval.manage','approval.approve','approval.delegate','rule.read','rule.manage','rule.publish','rule.execute','sla.read','sla.manage','sla.execute','notification.route.manage','automation.read','automation.manage','automation.publish','automation.execute','analytics.dashboard.manage','analytics.calculate','analytics.manage','analytics.read','prediction.read','prediction.manage','prediction.publish','prediction.execute','decision.read','decision.manage','decision.publish','decision.generate','decision.review','decision.simulate','insight.read','insight.manage','insight.acknowledge','insight.subscribe','integration.read','integration.manage','integration.execute','integration.credentials.manage','webhook.manage','eventbus.monitor','identity.read','identity.manage','identity.execute','identity.credentials.manage','connector.read','connector.manage','connector.execute','connector.resolve','enterprise.connector.read','enterprise.connector.manage','enterprise.connector.execute','collaboration.deliver','api.platform.read','api.platform.manage','api.application.read','api.application.manage','api.credential.manage','api.analytics.read','api.analytics.record','api.sdk.generate','api.marketplace.read','governance.read','governance.manage','policy.read','policy.manage','control.read','control.manage','evidence.read','evidence.manage','assessment.read','assessment.manage','risk.read','risk.manage','risk.assess','control.test','finding.manage','action.manage','grc.dashboard','identity.review','identity.certify','identity.sod.manage','identity.role.mine','identity.access.request','identity.privileged.manage','identity.analytics','ai.provider.manage','ai.model.manage','ai.prompt.manage','ai.execute','ai.audit.read','ai.analytics.read','ai.cost.read','ai.copilot.use','ai.copilot.action.suggest','ai.copilot.action.approve','knowledge.index.manage','knowledge.source.manage','knowledge.search','knowledge.query','knowledge.analytics.read','knowledge.settings.manage','ai.agent.read','ai.agent.manage','ai.agent.execute','ai.agent.approve','document.read','document.create','document.edit','document.manage','document.review.request','document.review','document.publish','workspace.read','workspace.create','workspace.manage','workspace.member.manage','workspace.announce','community.read','community.create','community.moderate','workplace.read','directory.read','announcement.read','announcement.manage','communication.manage','communication.publish','communication.analytics','developer.application.read','developer.application.manage','developer.credential.manage','developer.scope.read','developer.scope.manage','developer.usage.read','developer.audit.read','public_api.access','webhook.subscription.read','webhook.subscription.manage','webhook.secret.rotate','webhook.event.publish','webhook.delivery.read','webhook.delivery.manage','webhook.delivery.replay','webhook.analytics.read','data.connector.read','data.connector.manage','data.connection.read','data.connection.manage','data.credential.manage','data.sync.read','data.sync.manage','data.sync.execute','data.mapping.manage','data.conflict.read','data.conflict.resolve','data.sync.analytics','integration.automation.read','integration.automation.manage','integration.automation.publish','integration.automation.execute','integration.automation.approve','integration.automation.worker','integration.automation.analytics','marketplace.publisher.read','marketplace.publisher.manage','marketplace.listing.read','marketplace.listing.manage','marketplace.review','marketplace.install','marketplace.installation.read','marketplace.rating.create','marketplace.certify','marketplace.operations.read','marketplace.operations.manage','marketplace.analytics.read'];
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'Organization Admin': PERMISSIONS,
  'Manager': ['users.read','roles.read','okrs.read','okrs.manage','execution.read','execution.manage','resources.read','resources.manage','workflow.read','workflow.manage','workflow.publish','workflow.execute','approval.read','approval.manage','approval.approve','approval.delegate','rule.read','rule.manage','rule.publish','rule.execute','sla.read','sla.manage','sla.execute','notification.route.manage','automation.read','automation.manage','automation.publish','automation.execute','analytics.read','analytics.manage','analytics.calculate','analytics.dashboard.manage','prediction.read','prediction.manage','prediction.publish','prediction.execute','decision.read','decision.manage','decision.publish','decision.generate','decision.review','decision.simulate','insight.read','insight.manage','insight.acknowledge','insight.subscribe','integration.read','integration.execute','eventbus.monitor','identity.read','identity.execute','connector.read','connector.manage','connector.execute','connector.resolve','enterprise.connector.read','enterprise.connector.manage','enterprise.connector.execute','collaboration.deliver','api.platform.read','api.platform.manage','api.application.read','api.application.manage','api.credential.manage','api.analytics.read','api.sdk.generate','api.marketplace.read','governance.read','governance.manage','policy.read','policy.manage','control.read','control.manage','evidence.read','evidence.manage','assessment.read','assessment.manage','risk.read','risk.manage','risk.assess','control.test','finding.manage','action.manage','grc.dashboard','identity.review','identity.certify','identity.sod.manage','identity.role.mine','identity.access.request','identity.privileged.manage','identity.analytics','ai.execute','ai.analytics.read','ai.cost.read','ai.copilot.use','ai.copilot.action.suggest','ai.copilot.action.approve','knowledge.index.manage','knowledge.source.manage','knowledge.search','knowledge.query','knowledge.analytics.read','knowledge.settings.manage','ai.agent.read','ai.agent.manage','ai.agent.execute','ai.agent.approve','document.read','document.create','document.edit','document.manage','document.review.request','document.review','document.publish','workspace.read','workspace.create','workspace.manage','workspace.member.manage','workspace.announce','community.read','community.create','community.moderate','workplace.read','directory.read','announcement.read','announcement.manage','communication.manage','communication.publish','communication.analytics'],
  'Employee': ['okrs.read','okrs.manage','execution.read','resources.read','approval.read','approval.approve','approval.delegate','rule.read','rule.execute','sla.read','sla.manage','sla.execute','notification.route.manage','automation.read','automation.execute','analytics.read','analytics.calculate','prediction.read','prediction.execute','decision.read','decision.generate','decision.simulate','insight.read','insight.acknowledge','insight.subscribe','integration.read','identity.read','connector.read','connector.execute','enterprise.connector.read','enterprise.connector.execute','collaboration.deliver','api.platform.read','api.application.read','api.analytics.read','api.sdk.generate','api.marketplace.read','governance.read','policy.read','control.read','evidence.read','assessment.read','risk.read','identity.review','identity.access.request','ai.execute','ai.copilot.use','ai.copilot.action.suggest','knowledge.search','knowledge.query','ai.agent.read','ai.agent.execute','document.read','document.create','document.edit','document.review','workspace.read','workspace.create','community.read','community.create','workplace.read','directory.read','announcement.read'],
  'Viewer': ['okrs.read','execution.read','resources.read','approval.read','rule.read','sla.read','automation.read','analytics.read','prediction.read','decision.read','insight.read','connector.read','enterprise.connector.read','api.platform.read','api.application.read','api.analytics.read','api.marketplace.read','governance.read','policy.read','control.read','assessment.read','risk.read','ai.analytics.read','workspace.read','community.read','workplace.read','directory.read','announcement.read'],
};
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService, private readonly audit: AuditService) {}
  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
  private async seedOrganizationRoles(organizationId: string) {
    const permissionRows = await Promise.all(PERMISSIONS.map((key) => this.prisma.permission.upsert({ where: { key }, update: {}, create: { key, description: key.replace('.', ' ') } })));
    for (const [name, keys] of Object.entries(ROLE_PERMISSIONS)) {
      const role = await this.prisma.role.upsert({ where: { organizationId_name: { organizationId, name } }, update: {}, create: { organizationId, name, isSystem: true } });
      await this.prisma.rolePermission.createMany({ data: permissionRows.filter((p) => keys.includes(p.key)).map((p) => ({ roleId: role.id, permissionId: p.id })), skipDuplicates: true });
    }
  }
  private async userClaims(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
    const roles = user.roles.map((x) => x.role.name);
    const permissions = [...new Set(user.roles.flatMap((x) => x.role.permissions.map((p) => p.permission.key)))];
    return { sub: user.id, organizationId: user.organizationId, email: user.email, tokenVersion: user.tokenVersion, roles, permissions };
  }
  private async issueTokens(userId: string, context?: { ipAddress?: string; userAgent?: string }) {
    const claims = await this.userClaims(userId);
    const accessToken = await this.jwt.signAsync(claims, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_TTL', '15m') });
    const rawRefresh = randomBytes(48).toString('base64url');
    const refreshDays = Number(this.config.get('REFRESH_TOKEN_DAYS', 30));
    await this.prisma.$transaction([
      this.prisma.authToken.create({ data: { userId, organizationId: claims.organizationId, type: 'REFRESH', tokenHash: this.hashToken(rawRefresh), expiresAt: new Date(Date.now() + refreshDays * 86400000) } }),
      this.prisma.userSession.create({ data: { userId, organizationId: claims.organizationId, ipAddress: context?.ipAddress, userAgent: context?.userAgent, deviceName: context?.userAgent?.slice(0, 120), expiresAt: new Date(Date.now() + refreshDays * 86400000) } }),
    ]);
    return { accessToken, refreshToken: rawRefresh, expiresIn: 900 };
  }
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    if (await this.prisma.organization.findUnique({ where: { slug: dto.organizationSlug } })) throw new ConflictException('Organization slug already exists');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const result = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: { name: dto.organizationName, slug: dto.organizationSlug } });
      const user = await tx.user.create({ data: { organizationId: organization.id, email, firstName: dto.firstName, lastName: dto.lastName, passwordHash, status: 'ACTIVE', emailVerifiedAt: new Date() } });
      return { organization, user };
    });
    await this.seedOrganizationRoles(result.organization.id);
    const adminRole = await this.prisma.role.findUniqueOrThrow({ where: { organizationId_name: { organizationId: result.organization.id, name: 'Organization Admin' } } });
    await this.prisma.userRole.create({ data: { userId: result.user.id, roleId: adminRole.id } });
    await this.audit.record({ organizationId: result.organization.id, actorUserId: result.user.id, action: 'auth.organization_registered', entityType: 'Organization', entityId: result.organization.id });
    return { user: await this.profile(result.user.id), tokens: await this.issueTokens(result.user.id) };
  }
  async login(dto: LoginDto, context?: { ipAddress?: string; userAgent?: string }) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), organization: { slug: dto.organizationSlug } } });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash)) || user.status !== 'ACTIVE') throw new UnauthorizedException('Invalid credentials');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.audit.record({ organizationId: user.organizationId, actorUserId: user.id, action: 'auth.login', entityType: 'User', entityId: user.id, ...context });
    return { user: await this.profile(user.id), tokens: await this.issueTokens(user.id, context) };
  }
  async refresh(rawToken: string) {
    const token = await this.prisma.authToken.findUnique({ where: { tokenHash: this.hashToken(rawToken) } });
    if (!token || token.type !== 'REFRESH' || token.revokedAt || token.consumedAt || token.expiresAt <= new Date()) throw new UnauthorizedException('Invalid refresh token');
    const replacement = await this.issueTokens(token.userId);
    await this.prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } });
    return replacement;
  }
  async logout(userId: string, rawToken?: string) {
    if (rawToken) await this.prisma.authToken.updateMany({ where: { userId, tokenHash: this.hashToken(rawToken), type: 'REFRESH' }, data: { revokedAt: new Date() } });
    else { await this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }); await this.prisma.authToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); }
    return { success: true };
  }
  async profile(userId: string) {
    const c = await this.userClaims(userId);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, firstName: true, lastName: true, status: true, organization: { select: { id: true, name: true, slug: true, timezone: true, currency: true } } } });
    return { ...user, roles: c.roles, permissions: c.permissions };
  }
  async invite(actorId: string, organizationId: string, dto: InviteUserDto) {
    const email = dto.email.toLowerCase();
    const exists = await this.prisma.user.findFirst({ where: { organizationId, email } });
    if (exists) throw new ConflictException('User already exists in this organization');
    const roleNames = dto.roleNames?.length ? dto.roleNames : ['Employee'];
    const roles = await this.prisma.role.findMany({ where: { organizationId, name: { in: roleNames } } });
    if (roles.length !== roleNames.length) throw new BadRequestException('One or more roles are invalid');
    const user = await this.prisma.user.create({ data: { organizationId, email, firstName: dto.firstName, lastName: dto.lastName, roles: { create: roles.map((role) => ({ roleId: role.id })) } } });
    const rawToken = randomBytes(32).toString('base64url');
    await this.prisma.authToken.create({ data: { organizationId, userId: user.id, type: 'INVITATION', tokenHash: this.hashToken(rawToken), expiresAt: new Date(Date.now() + 7 * 86400000) } });
    await this.audit.record({ organizationId, actorUserId: actorId, action: 'auth.user_invited', entityType: 'User', entityId: user.id, metadata: { roleNames } });
    return { userId: user.id, invitationToken: rawToken, expiresInDays: 7 };
  }
  async acceptInvitation(dto: AcceptInvitationDto) {
    const token = await this.prisma.authToken.findUnique({ where: { tokenHash: this.hashToken(dto.token) } });
    if (!token || token.type !== 'INVITATION' || token.consumedAt || token.expiresAt <= new Date()) throw new BadRequestException('Invitation is invalid or expired');
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await bcrypt.hash(dto.password, 12), status: 'ACTIVE', emailVerifiedAt: new Date() } }), this.prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date() } })]);
    return { user: await this.profile(token.userId), tokens: await this.issueTokens(token.userId) };
  }
  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email.toLowerCase(), organization: { slug: dto.organizationSlug }, status: 'ACTIVE' } });
    if (!user) return { success: true };
    await this.prisma.authToken.updateMany({ where: { userId: user.id, type: 'PASSWORD_RESET', consumedAt: null }, data: { revokedAt: new Date() } });
    const rawToken = randomBytes(32).toString('base64url');
    await this.prisma.authToken.create({ data: { organizationId: user.organizationId, userId: user.id, type: 'PASSWORD_RESET', tokenHash: this.hashToken(rawToken), expiresAt: new Date(Date.now() + 60 * 60000) } });
    return { success: true, resetToken: rawToken, expiresInMinutes: 60 };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.authToken.findUnique({ where: { tokenHash: this.hashToken(dto.token) } });
    if (!token || token.type !== 'PASSWORD_RESET' || token.consumedAt || token.revokedAt || token.expiresAt <= new Date()) throw new BadRequestException('Reset token is invalid or expired');
    await this.prisma.$transaction([this.prisma.user.update({ where: { id: token.userId }, data: { passwordHash: await bcrypt.hash(dto.password, 12), tokenVersion: { increment: 1 } } }), this.prisma.authToken.updateMany({ where: { userId: token.userId, consumedAt: null }, data: { revokedAt: new Date() } }), this.prisma.authToken.update({ where: { id: token.id }, data: { consumedAt: new Date(), revokedAt: null } })]);
    return { success: true };
  }
}
