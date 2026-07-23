import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
export class CreateDirectoryConnectionDto {
 @IsString() @MinLength(2) name!: string;
 @IsEnum(['MICROSOFT_ENTRA','OKTA','GOOGLE_WORKSPACE','GENERIC_SCIM']) provider!: string;
 @IsOptional() @IsString() identityProviderId?: string;
 @IsOptional() @IsUrl() baseUrl?: string;
 @IsOptional() @IsString() tenantIdentifier?: string;
 @IsOptional() @IsString() credential?: string;
 @IsOptional() @IsEnum(['MANUAL','SCHEDULED','WEBHOOK']) syncMode?: string;
 @IsOptional() @IsString() scheduleCron?: string;
 @IsOptional() @IsBoolean() provisioningEnabled?: boolean;
 @IsOptional() @IsBoolean() deprovisioningEnabled?: boolean;
 @IsOptional() @IsBoolean() groupSyncEnabled?: boolean;
}
export class UpdateDirectoryConnectionDto extends CreateDirectoryConnectionDto { @IsOptional() @IsEnum(['DRAFT','ACTIVE','PAUSED','ERROR','DISABLED']) status?: string; }
export class UpsertAttributeMappingsDto { @IsArray() mappings!: Array<{sourceAttribute:string;targetAttribute:string;required?:boolean;transformation?:Record<string,unknown>}>; }
export class PreviewDirectorySyncDto { @IsOptional() @IsArray() users?: Array<Record<string,unknown>>; @IsOptional() @IsObject() options?: Record<string,unknown>; }
