# ADR-050 — Enterprise Communication and Digital Workplace

## Status
Accepted for Milestone 17 Sprint 17.5.

## Decision
AchieveX will expose a tenant-scoped Digital Workplace bounded context that aggregates governed announcements, communication campaigns, directory search, collaboration activity, approved documents, workspaces, communities, and user display preferences.

Announcements are lifecycle-managed and audience-targeted. Critical communications may require per-user acknowledgement. Campaign records govern intended channels and audiences; actual email and push delivery is delegated to the existing notification provider layer. The workplace home reads from authoritative domain modules and does not duplicate their records.

## Consequences
The design provides a unified employee entry point, explicit communication governance, measurable acknowledgement, and reusable APIs. Horizontal delivery scheduling and external channel execution require workers and configured providers in a deployment environment.
