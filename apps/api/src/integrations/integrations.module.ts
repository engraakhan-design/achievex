import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { WebhookJobsService } from './jobs/webhook-jobs.service';
import { IntegrationPlatformController } from './integration-platform.controller';
import { IntegrationPlatformService } from './integration-platform.service';
import { EnterpriseEventBusService } from './enterprise-event-bus.service';
import { BusinessConnectorsController } from './business-connectors/business-connectors.controller';
import { BusinessConnectorsService } from './business-connectors/business-connectors.service';
import { EnterpriseConnectorsController } from './enterprise-connectors/enterprise-connectors.controller';
import { EnterpriseConnectorsService } from './enterprise-connectors/enterprise-connectors.service';
@Module({imports:[EventsModule],controllers:[IntegrationsController,IntegrationPlatformController,BusinessConnectorsController,EnterpriseConnectorsController],providers:[IntegrationsService,WebhookJobsService,IntegrationPlatformService,EnterpriseEventBusService,BusinessConnectorsService,EnterpriseConnectorsService],exports:[IntegrationsService,IntegrationPlatformService,EnterpriseEventBusService,BusinessConnectorsService,EnterpriseConnectorsService]}) export class IntegrationsModule {}
