# AI Strategy Assistant

Milestone 9 introduces an auditable AI platform rather than a single chatbot endpoint.

## Capabilities

- Generate outcome-oriented objectives and measurable key results
- Rewrite weak objectives while preserving their intent
- Analyze active-cycle execution risk using measured OKR facts
- Produce executive briefings grounded in current cycle data
- Capture user feedback
- Track token usage, latency, estimated cost, model, provider, and prompt version

## Provider model

`AiProvider` is an internal abstraction. The included adapter supports:

- `mock`: deterministic local development with no external calls
- `openai-compatible`: any provider exposing the OpenAI chat-completions contract

Environment:

```env
AI_PROVIDER=mock
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=
AI_MODEL=gpt-4.1-mini
```

Provider credentials remain environment-managed in this milestone. Tenant-specific AI provider credentials should use the Milestone 8 tenant-secret abstraction in a future administration increment.

## Trust and safety controls

- The risk and executive-summary prompts explicitly prohibit invented data.
- Every completion records the factual request context and generated response.
- UI instructs users to review recommendations before applying them.
- Prompt versions are persisted for reproducibility.
- Feature flags can disable the assistant per tenant.
- Usage and estimated cost are available to tenant administrators.

## APIs

- `POST /api/v1/ai/objectives/generate`
- `POST /api/v1/ai/objectives/rewrite`
- `POST /api/v1/ai/risks/analyze`
- `POST /api/v1/ai/executive-summary`
- `GET /api/v1/ai/history`
- `GET /api/v1/ai/usage`
- `POST /api/v1/ai/generations/:id/feedback`
