# Webhook Security

Outbound payloads use HMAC-SHA256 signatures. Consumers should verify the raw body, reject stale/replayed delivery IDs, use TLS, rotate secrets, and respond idempotently. AchieveX records attempts, response summaries and dead-letter state.
