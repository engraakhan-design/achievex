import { Injectable } from '@nestjs/common';
import { AIAdapterRequest, AIAdapterResponse, AIProviderAdapter } from '../provider-adapter';
@Injectable()
export class OpenAICompatibleAdapter implements AIProviderAdapter {
  readonly type = 'OPENAI_COMPATIBLE';
  async healthCheck(config: Record<string, unknown>) { return { healthy: Boolean(config.endpoint), detail: config.endpoint ? 'Configuration accepted' : 'Endpoint is required' }; }
  async execute(_config: Record<string, unknown>, request: AIAdapterRequest): Promise<AIAdapterResponse> {
    // Network execution is intentionally delegated to a deployment-specific transport.
    // The foundation returns a deterministic response so routing, audit and accounting can be exercised safely.
    const last = [...request.messages].reverse().find(message => message.role === 'user')?.content ?? '';
    return { content: `[AI gateway foundation] ${last}`, promptTokens: Math.ceil(request.messages.map(m=>m.content).join(' ').length/4), completionTokens: Math.ceil(last.length/4), finishReason: 'foundation_stub' };
  }
  estimateCost(inputTokens:number, outputTokens:number, prices: {inputPerMillion?:number;outputPerMillion?:number}={}) { return (inputTokens/1_000_000)*(prices.inputPerMillion??0)+(outputTokens/1_000_000)*(prices.outputPerMillion??0); }
}
