import { Module } from '@nestjs/common'; import { IntegrationMarketplaceController } from './integration-marketplace.controller'; import { IntegrationMarketplaceService } from './integration-marketplace.service';
@Module({controllers:[IntegrationMarketplaceController],providers:[IntegrationMarketplaceService],exports:[IntegrationMarketplaceService]}) export class IntegrationMarketplaceModule{}
