# ADR-042 — Enterprise AI Copilot

## Decision
Implement the Copilot as a tenant-scoped conversational layer over the Sprint 16.1 AI Gateway. Conversations persist messages, record-level citations, feedback, and suggested actions. Suggested actions are never executed directly by the language model and require independent approval.

## Consequences
Business domains receive a consistent assistant surface, all model usage remains auditable and cost-accounted, and future RAG can replace the initial domain context resolvers without changing the conversation API.
