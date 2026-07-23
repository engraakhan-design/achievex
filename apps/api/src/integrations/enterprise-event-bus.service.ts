import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventsService } from '../events/events.service';
export type EnterpriseEventEnvelope<T=unknown>={eventId:string;eventType:string;organizationId:string;source:string;occurredAt:string;payload:T;metadata?:Record<string,unknown>};
@Injectable() export class EnterpriseEventBusService {constructor(private events:EventsService){}
 async publish<T>(input:Omit<EnterpriseEventEnvelope<T>,'eventId'|'occurredAt'>){const envelope={...input,eventId:randomUUID(),occurredAt:new Date().toISOString()};await this.events.publish({organizationId:input.organizationId,eventName:input.eventType,aggregateType:input.source,aggregateId:envelope.eventId,payload:envelope as any});return envelope;}
}
