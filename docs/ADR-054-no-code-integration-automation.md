# ADR-054 — No-Code Workflow Automation and Integration Builder

## Decision
AchieveX stores automation definitions as tenant-scoped directed graphs. Published versions are immutable and durable runs reference the published definition. Execution is delegated to distributed workers; the API remains the governance, orchestration-state, approval, and audit control plane.

## Reliability and safety
Runs use idempotency keys and correlation IDs. Steps carry attempt limits, timeouts, retry scheduling, restricted input/output metadata, and terminal states. Approval nodes require an independent decision. Connector credentials remain in the connector platform and are referenced, never copied into workflow definitions.

## Production boundary
Production requires a queue, distributed locks, scheduler, worker leases, adapter allow-lists, expression sandboxing, SSRF controls, secret management, observability, and retention policies.
