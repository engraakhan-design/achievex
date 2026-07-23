export type DeveloperApplicationEnvironment = 'DEVELOPMENT'|'SANDBOX'|'PRODUCTION';
export interface CreateDeveloperApplicationDto { name:string; description?:string; environment?:DeveloperApplicationEnvironment; ownerUserId?:string; redirectUris?:string[]; requestedScopes?:string[]; rateLimitPolicyId?:string; }
export interface UpdateDeveloperApplicationDto { name?:string; description?:string; status?:'ACTIVE'|'SUSPENDED'; redirectUris?:string[]; requestedScopes?:string[]; rateLimitPolicyId?:string|null; }
export interface CreateDeveloperCredentialDto { name?:string; scopes?:string[]; expiresAt?:string; }
export interface CreateAccessGrantDto { scope:string; resourceType?:string; resourceId?:string; expiresAt?:string; }
export interface CreateRateLimitPolicyDto { name:string; description?:string; limit:number; period:'MINUTE'|'HOUR'|'DAY'|'MONTH'; burstLimit?:number; environment?:DeveloperApplicationEnvironment; }
export interface RecordApiRequestDto { applicationId?:string; credentialId?:string; endpoint:string; method:string; statusCode:number; durationMs:number; correlationId:string; rateLimitDecision?:'ALLOWED'|'DENIED'; idempotencyKey?:string; }
