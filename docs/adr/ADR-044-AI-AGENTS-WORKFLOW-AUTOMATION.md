# ADR-044 — AI Agents and Workflow Automation

## Decision
AchieveX agents use a centralized orchestrator, an allow-listed tool registry, tenant-scoped persistence, bounded step counts, and independent approval for guarded actions. Agents may plan and read authorized data automatically, but write or sensitive tools require explicit approval. The requester cannot approve their own action.

## Consequences
All runs, steps, tool inputs, outputs, approvals, failures, and correlation IDs are auditable. Autonomous unbounded loops and direct provider-specific tool calls are prohibited.
