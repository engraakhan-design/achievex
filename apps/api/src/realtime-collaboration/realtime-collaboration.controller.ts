import { Body,Controller,Get,Headers,Param,Post } from '@nestjs/common'; import { PresenceHeartbeatDto,StartSessionDto } from './dto'; import { RealtimeCollaborationService } from './realtime-collaboration.service';
@Controller('realtime-collaboration') export class RealtimeCollaborationController{constructor(private readonly s:RealtimeCollaborationService){}private c(h:Record<string,string|undefined>){return {o:h['x-organization-id']||'',u:h['x-user-id']||'',x:h['x-connection-id']||'rest'}}
@Post('presence/heartbeat') heartbeat(@Headers()h:Record<string,string|undefined>,@Body()d:PresenceHeartbeatDto){const c=this.c(h);return this.s.heartbeat(c.o,c.u,c.x,d)}
@Get('presence') presence(@Headers()h:Record<string,string|undefined>){return this.s.listPresence(this.c(h).o)}
@Post('sessions') session(@Headers()h:Record<string,string|undefined>,@Body()d:StartSessionDto){const c=this.c(h);return this.s.startSession(c.o,c.u,d)}
@Post('sessions/:id/end') end(@Headers()h:Record<string,string|undefined>,@Param('id')id:string){const c=this.c(h);return this.s.endSession(c.o,c.u,id)}
@Post('messages/:id/read') read(@Headers()h:Record<string,string|undefined>,@Param('id')id:string){const c=this.c(h);return this.s.markRead(c.o,c.u,id)}
@Post('conversations/:id/typing') typing(@Headers()h:Record<string,string|undefined>,@Param('id')id:string,@Body()d:{isTyping:boolean}){const c=this.c(h);return this.s.typing(c.o,c.u,id,Boolean(d.isTyping))}}
