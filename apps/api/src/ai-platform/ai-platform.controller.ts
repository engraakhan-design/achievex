import { Body, Controller, Get, Post } from '@nestjs/common'; import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'; import { CurrentUser } from '../auth/decorators/current-user.decorator'; import { Permissions } from '../auth/decorators/permissions.decorator'; import { AuthenticatedUser } from '../auth/auth.types'; import { AIPlatformService } from './ai-platform.service'; import { CreateAIModelDto, CreateAIProviderDto, CreatePromptTemplateDto, ExecuteAIDto } from './dto';
@ApiTags('AI Platform') @ApiBearerAuth() @Controller('ai-platform') export class AIPlatformController {constructor(private readonly s:AIPlatformService){}
@Get('providers') @Permissions('ai.provider.manage') providers(@CurrentUser()u:AuthenticatedUser){return this.s.providers(u.organizationId)}
@Post('providers') @Permissions('ai.provider.manage') createProvider(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAIProviderDto){return this.s.createProvider(u.organizationId,d)}
@Get('models') @Permissions('ai.model.manage') models(@CurrentUser()u:AuthenticatedUser){return this.s.models(u.organizationId)}
@Post('models') @Permissions('ai.model.manage') createModel(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateAIModelDto){return this.s.createModel(u.organizationId,d)}
@Get('prompts') @Permissions('ai.prompt.manage') prompts(@CurrentUser()u:AuthenticatedUser){return this.s.prompts(u.organizationId)}
@Post('prompts') @Permissions('ai.prompt.manage') createPrompt(@CurrentUser()u:AuthenticatedUser,@Body()d:CreatePromptTemplateDto){return this.s.createPrompt(u.organizationId,u.sub,d)}
@Post('execute') @Permissions('ai.execute') execute(@CurrentUser()u:AuthenticatedUser,@Body()d:ExecuteAIDto){return this.s.execute(u.organizationId,u.sub,d)}
@Get('usage') @Permissions('ai.analytics.read') usage(@CurrentUser()u:AuthenticatedUser){return this.s.usage(u.organizationId)}
@Get('costs') @Permissions('ai.cost.read') costs(@CurrentUser()u:AuthenticatedUser){return this.s.costs(u.organizationId)}
@Get('audit') @Permissions('ai.audit.read') audit(@CurrentUser()u:AuthenticatedUser){return this.s.audit(u.organizationId)}
@Get('dashboard') @Permissions('ai.analytics.read') dashboard(@CurrentUser()u:AuthenticatedUser){return this.s.dashboard(u.organizationId)}}
