# ADR-012: Lightweight Work Management Inside Execution

## Status
Accepted

## Context
AchieveX needs enough task management to connect strategy to delivery, while avoiding the complexity and product direction of Jira, Linear or full project scheduling suites.

## Decision
Task management remains part of the Execution bounded context. The platform supports a Kanban workflow, hierarchy, checklists, discussion, labels, attachment references and task dependencies. Advanced engineering workflows remain integration concerns.

Attachments store metadata and provider-neutral storage keys, not binary payloads in PostgreSQL. Task dependencies are cycle-checked and constrained to a project in Sprint 10.3.

## Consequences

- Executives can trace delivery work without introducing a second work system.
- Teams can use AchieveX directly for strategic initiatives.
- Engineering teams can later synchronize external issue trackers through the Integration platform.
- File storage can evolve independently to S3, Azure Blob, Google Cloud Storage or a private object store.
