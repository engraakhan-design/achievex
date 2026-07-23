import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../../auth/auth.types';
import { CreateDecisionPolicyDto, CreateDecisionPolicyVersionDto, DecideRecommendationDto, GenerateRecommendationDto, SimulateDecisionDto } from './dto/decision-intelligence.dto';
import { DecisionIntelligenceService } from './decision-intelligence.service';
@Controller('analytics/decisions')
export class DecisionIntelligenceController { constructor(private service:DecisionIntelligenceService){}
 @Get('policies') @RequirePermissions('decision.read') policies(@CurrentUser()u:AuthenticatedUser){return this.service.listPolicies(u.organizationId)}
 @Post('policies') @RequirePermissions('decision.manage') create(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateDecisionPolicyDto){return this.service.createPolicy(u.organizationId,u.sub,d)}
 @Post('policies/:id/versions') @RequirePermissions('decision.manage') version(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:CreateDecisionPolicyVersionDto){return this.service.addVersion(u.organizationId,u.sub,id,d)}
 @Post('policies/:id/versions/:versionId/publish') @RequirePermissions('decision.publish') publish(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Param('versionId')v:string){return this.service.publish(u.organizationId,id,v)}
 @Post('policies/:id/recommendations') @RequirePermissions('decision.generate') generate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:GenerateRecommendationDto){return this.service.generate(u.organizationId,u.sub,id,d)}
 @Get('recommendations') @RequirePermissions('decision.read') list(@CurrentUser()u:AuthenticatedUser,@Query('status')status?:string,@Query('type')type?:string){return this.service.listRecommendations(u.organizationId,status,type)}
 @Get('recommendations/:id') @RequirePermissions('decision.read') detail(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.detail(u.organizationId,id)}
 @Post('recommendations/:id/decision') @RequirePermissions('decision.review') decide(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:DecideRecommendationDto){return this.service.decide(u.organizationId,u.sub,id,d)}
 @Post('policies/:id/simulations') @RequirePermissions('decision.simulate') simulate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Query('recommendationId')r:string|undefined,@Body()d:SimulateDecisionDto){return this.service.simulate(u.organizationId,u.sub,id,r,d)}
 @Get('dashboard') @RequirePermissions('decision.read') dashboard(@CurrentUser()u:AuthenticatedUser){return this.service.dashboard(u.organizationId)}
}
