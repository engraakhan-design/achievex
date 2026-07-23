import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { AuditModule } from '../audit/audit.module';
import { OkrsController } from './okrs.controller';
import { OkrsService } from './okrs.service';
@Module({ imports:[AuditModule, EventsModule], controllers:[OkrsController], providers:[OkrsService] }) export class OkrsModule {}
