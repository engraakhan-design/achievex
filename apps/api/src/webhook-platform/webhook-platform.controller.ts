import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { CreateWebhookSubscriptionDto, EmitWebhookEventDto, UpdateWebhookSubscriptionDto } from './dto';
import { WebhookPlatformService } from './webhook-platform.service';
@ApiTags('Webhook Platform') @ApiBearerAuth() @Controller('v1/webhooks')
export class WebhookPlatformController { constructor(private readonly service:WebhookPlatformService){}
@Get('subscriptions') @Permissions('webhook.subscription.read') subscriptions(@CurrentUser()u:AuthenticatedUser){return this.service.listSubscriptions(u.organizationId)}
@Post('subscriptions') @Permissions('webhook.subscription.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateWebhookSubscriptionDto){return this.service.createSubscription(u.organizationId,u.sub,d)}
@Patch('subscriptions/:id') @Permissions('webhook.subscription.manage') update(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateWebhookSubscriptionDto){return this.service.updateSubscription(u.organizationId,id,d)}
@Post('subscriptions/:id/rotate-secret') @Permissions('webhook.secret.rotate') rotate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.rotateSecret(u.organizationId,id)}
@Post('events') @Permissions('webhook.event.publish') emit(@CurrentUser()u:AuthenticatedUser,@Body()d:EmitWebhookEventDto){return this.service.emit(u.organizationId,d)}
@Get('deliveries') @Permissions('webhook.delivery.read') deliveries(@CurrentUser()u:AuthenticatedUser,@Query('take')take?:string,@Query('status')status?:string){return this.service.deliveries(u.organizationId,Number(take)||100,status)}
@Post('deliveries/:id/attempt') @Permissions('webhook.delivery.manage') attempt(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.attempt(u.organizationId,id)}
@Post('deliveries/:id/replay') @Permissions('webhook.delivery.replay') replay(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.replay(u.organizationId,id)}
@Post('process-due') @Permissions('webhook.delivery.manage') process(@CurrentUser()u:AuthenticatedUser,@Query('limit')limit?:string){return this.service.processDue(u.organizationId,Number(limit)||25)}
@Get('analytics') @Permissions('webhook.analytics.read') analytics(@CurrentUser()u:AuthenticatedUser,@Query('days')days?:string){return this.service.analytics(u.organizationId,Number(days)||30)} }
