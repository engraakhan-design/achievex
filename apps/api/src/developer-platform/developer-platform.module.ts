import { Module } from '@nestjs/common';
import { DeveloperPlatformController } from './developer-platform.controller';
import { DeveloperPlatformService } from './developer-platform.service';
import { ApiKeyGuard } from './guards/api-key.guard';
import { PublicApiV2Controller } from './public-api-v2.controller';
import { DeveloperPlatformV1Controller } from './developer-platform-v1.controller';
import { DeveloperPlatformV1Service } from './developer-platform-v1.service';
import { PublicApiV1Controller } from './public-api-v1.controller';
import { DeveloperApiKeyGuard } from './guards/developer-api-key.guard';

@Module({
  controllers: [DeveloperPlatformController, DeveloperPlatformV1Controller, PublicApiV1Controller, PublicApiV2Controller],
  providers: [DeveloperPlatformService, DeveloperPlatformV1Service, ApiKeyGuard, DeveloperApiKeyGuard],
  exports: [DeveloperPlatformService, DeveloperPlatformV1Service],
})
export class DeveloperPlatformModule {}
