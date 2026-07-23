import { Module } from '@nestjs/common';
import { IntegrationAutomationController } from './integration-automation.controller';
import { IntegrationAutomationService } from './integration-automation.service';
@Module({controllers:[IntegrationAutomationController],providers:[IntegrationAutomationService],exports:[IntegrationAutomationService]})
export class IntegrationAutomationModule {}
