# ADR-049 — Team Workspaces and Communities

## Status
Accepted for Milestone 17 Sprint 17.4.

## Decision
AchieveX will separate governed delivery workspaces from cross-functional communities of practice. Workspaces own membership, announcements, and links to business resources. Communities may stand alone or be attached to a workspace and enforce an explicit membership policy.

All records are organization-scoped. Workspace administration requires an OWNER or ADMIN membership. Community membership administration requires OWNER or MODERATOR membership. The last active workspace owner cannot remove themselves.

## Consequences
This creates a reusable digital-workplace boundary without coupling workspace governance to OKR, project, document, or collaboration schemas. Resources are linked polymorphically by type and identifier, allowing future modules to participate without migrations for each new resource type.
