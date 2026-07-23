# Milestone 10 — Sprint 10.3 Release Notes

## Work Management

Sprint 10.3 adds lightweight project work management without attempting to replace specialist engineering ticketing systems.

Delivered capabilities:

- Project Kanban board with TODO, IN_PROGRESS, BLOCKED and DONE columns
- Position-aware task movement with completion timestamps
- Task detail workspace
- Parent tasks and subtasks
- Task comments and discussion history
- Checklist items with completion tracking
- Tenant-owned execution labels
- Attachment metadata and external download references
- Assignee-centric task listing and filtering
- In-project task dependencies with circular dependency prevention
- Activity and domain events for all important task actions

## Security and tenancy

All task-related records carry `organizationId`. Service methods validate that tasks, labels, users and dependency endpoints belong to the authenticated tenant. Task dependencies are intentionally limited to tasks in the same project for this release.

## Storage boundary

The attachment API records metadata and a storage key. Binary upload and signed-download adapters are deliberately delegated to the future Files platform capability or an S3-compatible provider.

## Validation

Parser-level and structural validation is included. A complete Prisma client generation, database migration test, NestJS build, Next.js build and Jest run require installed dependencies and a PostgreSQL test database.
