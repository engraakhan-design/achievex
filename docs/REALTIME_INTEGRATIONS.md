# Real-Time Collaboration and Integrations

Milestone 7 introduces an authenticated SSE heartbeat, live unread-notification counts, scoped API keys, outbound webhook subscriptions, HMAC SHA-256 signatures, durable delivery records, exponential retries, dead-letter handling, and automatic subscription pausing after repeated failures.

Webhook headers: `x-achievex-event`, `x-achievex-delivery`, and `x-achievex-signature: sha256=<digest>`. Consumers must calculate the HMAC over the raw request body with the one-time webhook secret and compare signatures using a timing-safe function.

Production deployment should run webhook jobs in one dedicated worker (`WEBHOOK_JOBS_ENABLED=true`) and disable them on API replicas. Replace the polling worker with BullMQ once Redis-backed workers are separated.
