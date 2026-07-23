import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { CollaborationService } from './collaboration.service'; import { CreateConversationDto,CreateMessageDto,CreateReactionDto } from './dto';
@Controller('collaboration') export class CollaborationController { constructor(private readonly service:CollaborationService){} private ctx(h:Record<string,string|undefined>){return {organizationId:h['x-organization-id']||'',userId:h['x-user-id']||''};}
@Get('conversations') list(@Headers() h:Record<string,string|undefined>){const c=this.ctx(h);return this.service.list(c.organizationId,c.userId)}
@Post('conversations') create(@Headers() h:Record<string,string|undefined>,@Body() d:CreateConversationDto){const c=this.ctx(h);return this.service.create(c.organizationId,c.userId,d)}
@Get('conversations/:id/messages') messages(@Headers() h:Record<string,string|undefined>,@Param('id') id:string){const c=this.ctx(h);return this.service.messages(c.organizationId,c.userId,id)}
@Post('conversations/:id/messages') post(@Headers() h:Record<string,string|undefined>,@Param('id') id:string,@Body() d:CreateMessageDto){const c=this.ctx(h);return this.service.postMessage(c.organizationId,c.userId,id,d)}
@Post('reactions') react(@Headers() h:Record<string,string|undefined>,@Body() d:CreateReactionDto){const c=this.ctx(h);return this.service.react(c.organizationId,c.userId,d)}
@Get('activity/feed') feed(@Headers() h:Record<string,string|undefined>){const c=this.ctx(h);return this.service.feed(c.organizationId,c.userId)} }
