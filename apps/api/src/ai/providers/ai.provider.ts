export type AiMessage = { role: 'system' | 'user'; content: string };
export type AiCompletion = { text: string; inputTokens: number; outputTokens: number; model: string; provider: string };

export abstract class AiProvider {
  abstract complete(messages: AiMessage[], options?: { temperature?: number; responseFormat?: 'json' | 'text' }): Promise<AiCompletion>;
}
