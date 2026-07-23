export type ConnectorContext = { organizationId: string; instanceId: string; configuration?: Record<string, unknown>; credential?: Record<string, unknown> };
export type ConnectorResult<T = unknown> = { success: boolean; data?: T; retryable?: boolean; externalId?: string; metadata?: Record<string, unknown> };
export interface EnterpriseConnector {
  authenticate(context: ConnectorContext): Promise<ConnectorResult>;
  validate(context: ConnectorContext): Promise<ConnectorResult>;
  testConnection(context: ConnectorContext): Promise<ConnectorResult>;
  healthCheck(context: ConnectorContext): Promise<ConnectorResult>;
  pull(context: ConnectorContext, cursor?: string): Promise<ConnectorResult>;
  push(context: ConnectorContext, records: unknown[]): Promise<ConnectorResult>;
  subscribe(context: ConnectorContext, events: string[]): Promise<ConnectorResult>;
  unsubscribe(context: ConnectorContext): Promise<ConnectorResult>;
  handleWebhook(context: ConnectorContext, payload: unknown, headers: Record<string,string>): Promise<ConnectorResult>;
  disconnect(context: ConnectorContext): Promise<ConnectorResult>;
}
