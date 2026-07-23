import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiCompletion, AiMessage, AiProvider } from './ai.provider';

@Injectable()
export class ConfigurableAiProvider implements AiProvider {
  constructor(private readonly config: ConfigService) {}

  async complete(messages: AiMessage[], options: { temperature?: number; responseFormat?: 'json' | 'text' } = {}): Promise<AiCompletion> {
    const provider = (this.config.get<string>('AI_PROVIDER') ?? 'mock').toLowerCase();
    if (provider !== 'openai-compatible') return this.mock(messages, options.responseFormat);

    const baseUrl = this.config.get<string>('AI_BASE_URL');
    const apiKey = this.config.get<string>('AI_API_KEY');
    const model = this.config.get<string>('AI_MODEL') ?? 'gpt-4.1-mini';
    if (!baseUrl || !apiKey) throw new Error('AI_BASE_URL and AI_API_KEY are required for openai-compatible provider');

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: options.temperature ?? 0.2, ...(options.responseFormat === 'json' ? { response_format: { type: 'json_object' } } : {}) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`AI provider failed with ${response.status}`);
    const body: any = await response.json();
    return { text: body.choices?.[0]?.message?.content ?? '', inputTokens: body.usage?.prompt_tokens ?? 0, outputTokens: body.usage?.completion_tokens ?? 0, model, provider };
  }

  private mock(messages: AiMessage[], responseFormat?: 'json' | 'text'): AiCompletion {
    const user = [...messages].reverse().find((m: AiMessage) => m.role === 'user')?.content ?? messages[messages.length - 1]?.content ?? '';
    const inputTokens = Math.ceil(messages.map(m => m.content).join(' ').length / 4);
    const json = responseFormat === 'json';
    const text = json
      ? JSON.stringify({ summary: 'Development AI provider response', guidance: ['Connect an OpenAI-compatible provider for production-quality generation.'], sourceContext: user.slice(0, 180) })
      : `Development AI provider response. Configure AI_PROVIDER=openai-compatible to enable production generation. Context: ${user.slice(0, 240)}`;
    return { text, inputTokens, outputTokens: Math.ceil(text.length / 4), model: 'achievex-mock-v1', provider: 'mock' };
  }
}
