# Authentication and RBAC

## Implemented flows
- Organization registration creates the first Organization Admin.
- Login issues a 15-minute JWT access token and an opaque refresh token.
- Refresh tokens are SHA-256 hashed in PostgreSQL and are single-use.
- Logout can revoke one refresh token or invalidate every active session by incrementing `tokenVersion`.
- Organization administrators can invite users and assign predefined roles.
- Invitation and password-reset tokens are opaque, hashed, expiring, and single-use.
- Every protected request runs through the JWT guard, then the permission guard.
- Login, registration, and invitations create audit-log entries.

## Default roles
- Organization Admin: all current permissions
- Manager: people visibility, role visibility, and OKR management
- Employee: OKR read and manage
- Viewer: OKR read

## Production notes
The API currently returns invitation and password-reset tokens in its response so the flow is testable before an email provider is integrated. Remove these response fields after wiring transactional email.
