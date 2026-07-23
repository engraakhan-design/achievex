import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { AddFieldMappingDto, CreateConnectionDto, CreateSyncDefinitionDto, ResolveConflictDto, UpdateConnectionDto } from './dto';
import { DataSyncPlatformService } from './data-sync-platform.service';
@ApiTags('Enterprise Data Synchronization') @ApiBearerAuth() @Controller('v1/data-sync')
export class DataSyncPlatformController { constructor(private readonly service:DataSyncPlatformService){}
@Get('catalog') @Permissions('data.connector.read') catalog(){return this.service.catalog()}
@Post('catalog/seed') @Permissions('data.connector.manage') seed(){return this.service.seedCatalog()}
@Get('connections') @Permissions('data.connection.read') connections(@CurrentUser()u:AuthenticatedUser){return this.service.connections(u.organizationId)}
@Post('connections') @Permissions('data.connection.manage') createConnection(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateConnectionDto){return this.service.createConnection(u.organizationId,u.sub,d)}
@Patch('connections/:id') @Permissions('data.connection.manage') updateConnection(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:UpdateConnectionDto){return this.service.updateConnection(u.organizationId,id,d)}
@Post('connections/:id/rotate-credential') @Permissions('data.credential.manage') rotate(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body('credential')credential:string){return this.service.rotateCredential(u.organizationId,id,credential)}
@Get('definitions') @Permissions('data.sync.read') definitions(@CurrentUser()u:AuthenticatedUser){return this.service.definitions(u.organizationId)}
@Post('definitions') @Permissions('data.sync.manage') createDefinition(@CurrentUser()u:AuthenticatedUser,@Body()d:CreateSyncDefinitionDto){return this.service.createDefinition(u.organizationId,d)}
@Post('definitions/:id/mappings') @Permissions('data.mapping.manage') mapping(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:AddFieldMappingDto){return this.service.addMapping(u.organizationId,id,d)}
@Post('definitions/:id/run') @Permissions('data.sync.execute') run(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string){return this.service.startRun(u.organizationId,u.sub,id)}
@Get('runs') @Permissions('data.sync.read') runs(@CurrentUser()u:AuthenticatedUser,@Query('take')take?:string){return this.service.runs(u.organizationId,Number(take)||100)}
@Get('conflicts') @Permissions('data.conflict.read') conflicts(@CurrentUser()u:AuthenticatedUser,@Query('status')status?:string){return this.service.conflicts(u.organizationId,status)}
@Post('conflicts/:id/resolve') @Permissions('data.conflict.resolve') resolve(@CurrentUser()u:AuthenticatedUser,@Param('id')id:string,@Body()d:ResolveConflictDto){return this.service.resolve(u.organizationId,u.sub,id,d)}
@Get('analytics') @Permissions('data.sync.analytics') analytics(@CurrentUser()u:AuthenticatedUser,@Query('days')days?:string){return this.service.analytics(u.organizationId,Number(days)||30)} }
