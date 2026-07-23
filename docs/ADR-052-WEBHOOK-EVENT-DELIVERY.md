# ADR-052 — Webhooks, Event Subscriptions and Delivery Reliability

## Decision
AchieveX uses a tenant-scoped durable event/outbox model. Events are persisted before fan-out. Each matching subscription receives an independent delivery record with bounded exponential retry. Payloads are signed with HMAC-SHA256 and encrypted signing secrets. Exhausted deliveries are retained as dead letters for governed replay.

## Security
Only HTTPS endpoints are accepted. Secrets are displayed once and encrypted at rest with `WEBHOOK_ENCRYPTION_KEY`. Production must use outbound egress allow-lists, SSRF protection, DNS/IP revalidation, queue workers, distributed locks, and secret rotation procedures.
