import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../auth/auth.types';
import { CreatePredictionModelDto, CreatePredictionVersionDto, PredictionQueryDto, RunPredictionDto } from './dto/predictive.dto';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
@Controller('analytics/predictions')
export class PredictiveAnalyticsController {constructor(private service:PredictiveAnalyticsService){}
 @Get('models') @RequirePermissions('prediction.read') models(@CurrentUser()u:AuthenticatedUser){return this.service.listModels(u.organizationId)}
 @Post('models') @RequirePermissions('prediction.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreatePredictionModelDto){return this.service.createModel(u.organizationId,u.sub,d)}
 @Post('models/:id/versions') @RequirePermissions('prediction.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreatePredictionVersionDto){return this.service.addVersion(u.organizationId,u.sub,id,d)}
 @Post('models/:id/versions/:versionId/publish') @RequirePermissions('prediction.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('versionId')v:string){return this.service.publish(u.organizationId,id,v)}
 @Post('models/:id/run') @RequirePermissions('prediction.execute') run(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:RunPredictionDto){return this.service.run(u.organizationId,u.sub,id,d)}
 @Get('results') @RequirePermissions('prediction.read') results(@CurrentUser()u:AuthenticatedUser,@Query()q:PredictionQueryDto){return this.service.results(u.organizationId,q)}
 @Get('runs') @RequirePermissions('prediction.read') runs(@CurrentUser()u:AuthenticatedUser,@Query('modelId')modelId?:string){return this.service.runs(u.organizationId,modelId)}
}
