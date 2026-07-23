import { IsArray, IsBoolean, IsEmail, IsEnum, IsInt, IsObject, IsOptional, IsString, IsUrl, Matches, Max, Min, MinLength } from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional() @IsString() @MinLength(2) productName?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsUrl() darkLogoUrl?: string;
  @IsOptional() @IsUrl() faviconUrl?: string;
  @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/) primaryColor?: string;
  @IsOptional() @Matches(/^#[0-9A-Fa-f]{6}$/) secondaryColor?: string;
  @IsOptional() @IsUrl() loginBackgroundUrl?: string;
  @IsOptional() @IsEmail() supportEmail?: string;
  @IsOptional() @IsUrl() supportUrl?: string;
  @IsOptional() @IsString() customCss?: string;
}

export class UpdateSecurityPolicyDto {
  @IsOptional() @IsBoolean() ssoRequired?: boolean;
  @IsOptional() @IsInt() @Min(8) @Max(128) passwordMinLength?: number;
  @IsOptional() @IsBoolean() passwordRequireUppercase?: boolean;
  @IsOptional() @IsBoolean() passwordRequireLowercase?: boolean;
  @IsOptional() @IsBoolean() passwordRequireNumber?: boolean;
  @IsOptional() @IsBoolean() passwordRequireSymbol?: boolean;
  @IsOptional() @IsInt() @Min(1) @Max(365) passwordExpiryDays?: number;
  @IsOptional() @IsInt() @Min(3) @Max(20) maxFailedAttempts?: number;
  @IsOptional() @IsInt() @Min(1) @Max(1440) lockoutMinutes?: number;
  @IsOptional() @IsInt() @Min(5) @Max(1440) sessionIdleMinutes?: number;
  @IsOptional() @IsInt() @Min(1) @Max(8760) sessionAbsoluteHours?: number;
  @IsOptional() @IsBoolean() mfaRequired?: boolean;
  @IsOptional() @IsArray() @IsString({ each: true }) allowedIpCidrs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) allowedCountries?: string[];
}

export class UpdateCompliancePolicyDto {
  @IsOptional() @IsInt() @Min(30) auditRetentionDays?: number;
  @IsOptional() @IsInt() @Min(30) activityRetentionDays?: number;
  @IsOptional() @IsInt() @Min(1) softDeleteRetentionDays?: number;
  @IsOptional() @IsInt() @Min(30) notificationRetentionDays?: number;
  @IsOptional() @IsBoolean() legalHoldEnabled?: boolean;
  @IsOptional() @IsString() dataResidencyRegion?: string;
  @IsOptional() @IsEmail() privacyContactEmail?: string;
}

export class UpdateFeatureFlagDto {
  @IsBoolean() enabled!: boolean;
  @IsOptional() @IsObject() value?: Record<string, unknown>;
  @IsOptional() @IsInt() @Min(0) @Max(100) rolloutPercentage?: number;
}

export class CreateDomainDto {
  @IsString() @Matches(/^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/i) domain!: string;
  @IsOptional() @IsBoolean() autoJoinEnabled?: boolean;
  @IsOptional() @IsBoolean() restrictInvites?: boolean;
}

export class UpdateDomainDto {
  @IsOptional() @IsBoolean() autoJoinEnabled?: boolean;
  @IsOptional() @IsBoolean() restrictInvites?: boolean;
}

export class CreateIdentityProviderDto {
  @IsString() @MinLength(2) name!: string;
  @IsEnum(['OIDC', 'SAML']) type!: 'OIDC' | 'SAML';
  @IsOptional() @IsUrl() issuerUrl?: string;
  @IsOptional() @IsUrl() authorizationUrl?: string;
  @IsOptional() @IsUrl() tokenUrl?: string;
  @IsOptional() @IsUrl() userInfoUrl?: string;
  @IsOptional() @IsString() clientId?: string;
  @IsOptional() @IsString() clientSecret?: string;
  @IsOptional() @IsUrl() metadataUrl?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() certificate?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) emailDomains?: string[];
  @IsOptional() @IsBoolean() jitProvisioning?: boolean;
  @IsOptional() @IsString() defaultRoleName?: string;
}

export class UpdateIdentityProviderDto extends CreateIdentityProviderDto {
  @IsOptional() @IsEnum(['DRAFT', 'ACTIVE', 'DISABLED']) status?: 'DRAFT' | 'ACTIVE' | 'DISABLED';
}

export class CreateScimTokenDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsInt() @Min(1) @Max(3650) expiresInDays?: number;
}

export class UpsertSettingDto {
  @IsString() namespace!: string;
  @IsString() key!: string;
  value!: unknown;
}
