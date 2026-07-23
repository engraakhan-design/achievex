# AchieveX Stabilization v1.0.4

## Prisma relation repair

This release resolves the five P1012 relation validation errors reported after v1.0.3.

- `Resource.userId` is now `@unique`, matching the optional one-to-one `User.resourceProfile` relation.
- Removed accidental `Resource.workflowDefinitions`, `Resource.workflowInstances`, `Resource.workflowTasks`, and `Resource.workflowHistory` collection fields.
- Preserved the correct organization-scoped workflow relations on `Organization`.
- Removed the redundant composite unique constraint on `[organizationId, userId]`.

The workflow service uses user identifiers for creators, starters, assignees, completers, and actors. It does not define direct workflow-to-resource relations, so no workflow model columns or migrations were added.
