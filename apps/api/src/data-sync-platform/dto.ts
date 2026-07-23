import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
export enum SyncDirectionDto { INBOUND='INBOUND', OUTBOUND='OUTBOUND', BIDIRECTIONAL='BIDIRECTIONAL' }
export enum SyncTriggerDto { MANUAL='MANUAL', SCHEDULED='SCHEDULED', EVENT='EVENT' }
export enum ConflictPolicyDto { SOURCE_WINS='SOURCE_WINS', TARGET_WINS='TARGET_WINS', LATEST_WINS='LATEST_WINS', MANUAL='MANUAL' }
export class CreateConnectionDto { @IsString() connectorDefinitionId!:string; @IsString() name!:string; @IsOptional() @IsString() baseUrl?:string; @IsOptional() @IsString() tenantKey?:string; @IsOptional() @IsString() credential?:string; @IsOptional() @IsObject() settings?:Record<string,unknown>; }
export class UpdateConnectionDto { @IsOptional() @IsString() status?:string; @IsOptional() @IsString() baseUrl?:string; @IsOptional() @IsObject() settings?:Record<string,unknown>; }
export class CreateSyncDefinitionDto { @IsString() connectionId!:string; @IsString() name!:string; @IsString() sourceObject!:string; @IsString() targetEntity!:string; @IsEnum(SyncDirectionDto) direction!:SyncDirectionDto; @IsEnum(SyncTriggerDto) trigger!:SyncTriggerDto; @IsOptional() @IsString() scheduleCron?:string; @IsEnum(ConflictPolicyDto) conflictPolicy!:ConflictPolicyDto; @IsOptional() @IsObject() filter?:Record<string,unknown>; }
export class AddFieldMappingDto { @IsString() sourceField!:string; @IsString() targetField!:string; @IsOptional() @IsObject() transform?:Record<string,unknown>; @IsOptional() @IsBoolean() required?:boolean; @IsOptional() @IsBoolean() sensitive?:boolean; }
export class ResolveConflictDto { @IsEnum(ConflictPolicyDto) resolution!:ConflictPolicyDto; @IsOptional() @IsString() notes?:string; }
export class SeedConnectorsDto { @IsOptional() @IsArray() keys?:string[]; }
