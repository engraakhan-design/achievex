# Enterprise AI Copilot

Sprint 16.2 introduces domain workspaces for OKRs, projects, governance, analytics, and general assistance. Context resolvers retrieve a bounded set of tenant records and attach citations to assistant messages. The Copilot stores conversation history and feedback while delegating all model execution, accounting, and audit behavior to the AI Platform Gateway.

Suggested actions are stored separately with `SUGGESTED`, `APPROVED`, `REJECTED`, `EXECUTED`, and `FAILED` states. Approval must be performed by a different user. This sprint does not implement autonomous execution.
