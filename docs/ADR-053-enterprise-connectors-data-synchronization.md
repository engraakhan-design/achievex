# ADR-053 — Enterprise Connectors and Data Synchronization

## Decision
AchieveX will use a provider-neutral synchronization control plane over existing connector adapters. The control plane owns tenant-scoped connections, encrypted credentials, sync definitions, mappings, checkpoints, durable runs, item outcomes, conflict records, and analytics. Provider workers own external API calls.

## Rationale
The repository already contains Workday, SAP SuccessFactors, BambooHR, HiBob, Jira, Azure DevOps, GitHub, GitLab, ServiceNow, Slack, Microsoft Teams, Google Workspace, and Microsoft 365 foundations. A unified control plane prevents duplicating adapters and gives consistent governance.

## Security
Credentials are encrypted with AES-256-GCM using CONNECTOR_ENCRYPTION_KEY. Logs must never contain clear credentials or unrestricted source payloads. Tenant scope is mandatory on all operational records.

## Reliability
Incremental synchronization uses persisted checkpoints. Runs and item outcomes are durable. Production workers require distributed scheduling, locking, idempotency, provider throttling, retry queues, and dead-letter handling.
