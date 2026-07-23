import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiProvider } from './providers/ai.provider';
import { ConfigurableAiProvider } from './providers/configurable-ai.provider';
@Module({ imports: [AuditModule], controllers: [AiController], providers: [AiService, ConfigurableAiProvider, { provide: AiProvider, useExisting: ConfigurableAiProvider }], exports: [AiService] })
export class AiModule {}
