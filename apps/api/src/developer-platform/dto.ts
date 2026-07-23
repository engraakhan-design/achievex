export interface CreateApiApplicationDto { name: string; description?: string; redirectUris?: string[]; scopes?: string[]; }
export interface RotateApiCredentialDto { expiresAt?: string; }
export interface CreateApiProductDto { name: string; slug: string; description?: string; audience?: 'PRIVATE'|'PARTNER'|'PUBLIC'; version?: string; scopes?: string[]; }
export interface PublishApiVersionDto { version: string; lifecycle?: 'DRAFT'|'BETA'|'STABLE'|'DEPRECATED'|'RETIRED'; changelog?: string; sunsetAt?: string; }
export interface RecordUsageDto { applicationId?: string; apiProductId?: string; route: string; method: string; statusCode: number; durationMs: number; requestId?: string; units?: number; }
export interface GenerateSdkDto { language: 'typescript'|'python'|'java'|'csharp'; apiVersion?: string; }
