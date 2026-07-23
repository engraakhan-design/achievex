# Organization and User Management

Milestone 3 adds tenant-scoped administration for the organization profile, users, departments, teams, and roles.

## API areas

- `GET/PATCH /api/v1/organization`
- `GET/PATCH/DELETE /api/v1/users/:id`
- `GET/POST/PATCH/DELETE /api/v1/departments`
- `GET/POST/PATCH/DELETE /api/v1/teams`
- `PUT /api/v1/teams/:id/members`
- `GET/POST/PATCH/DELETE /api/v1/roles`
- `GET /api/v1/roles/permissions`

Every query is scoped by the organization identifier from the authenticated JWT rather than accepting tenant identifiers from the client.

## Security behavior

- Suspended and deactivated users have their sessions revoked.
- Users cannot deactivate their own account.
- Managers and departments must belong to the same organization.
- System roles cannot be renamed or deleted.
- Custom roles with assigned users cannot be deleted.
- Organization, user, department, team, and role mutations are written to the audit log.

## UI

Administration screens are available at `/people`, `/departments`, `/teams`, and `/settings/roles`.
