export type ApiHealth = { status: 'ok' | 'degraded'; service: string; database: 'up' | 'down'; timestamp: string };
export type TenantContext = { organizationId: string; userId: string; roleIds: string[] };
