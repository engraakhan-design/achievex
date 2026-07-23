# Team Workspaces and Communities Guide

Workspaces provide governed operating spaces for delivery teams. Communities connect practitioners across organizational structures.

## Workspace APIs
- `GET /workspaces`
- `POST /workspaces`
- `GET /workspaces/:id`
- `PATCH /workspaces/:id`
- `POST /workspaces/:id/members`
- `DELETE /workspaces/:id/members/:userId`
- `POST /workspaces/:id/resources`
- `POST /workspaces/:id/announcements`

## Community APIs
- `GET /communities`
- `POST /communities`
- `POST /communities/:id/members`

## Governance
Private workspaces are visible only to members. Public workspaces are discoverable across the organization. Owner and admin roles govern membership and linked resources. Community owners and moderators govern community membership.
