export type AIMessageRole = 'system' | 'user' | 'assistant';
export interface AIMessage { role: AIMessageRole; content: string }
export interface AIAdapterRequest { model: string; messages: AIMessage[]; maxTokens?: number; temperature?: number; correlationId: string }
export interface AIAdapterResponse { content: string; promptTokens?: number; completionTokens?: number; providerRequestId?: string; finishReason?: string }
export interface AIProviderAdapter {
  readonly type: string;
  healthCheck(config: Record<string, unknown>): Promise<{ healthy: boolean; detail?: string }>;
  execute(config: Record<string, unknown>, request: AIAdapterRequest): Promise<AIAdapterResponse>;
  estimateCost(inputTokens: number, outputTokens: number, prices?: { inputPerMillion?: number; outputPerMillion?: number }): number;
}
