# Sprint 18.1 Developer Platform Guide

1. Register an application in development, sandbox, or production.
2. Approve only required scopes.
3. Assign a tenant rate-limit policy.
4. Issue a credential and copy the secret immediately.
5. Send the secret in `X-AchieveX-API-Key`.
6. Use `X-Correlation-ID` for end-to-end support tracing and `Idempotency-Key` on retryable writes.
7. Rotate credentials before expiry and revoke compromised credentials immediately.
8. Review request logs and usage analytics without retaining request bodies.

## Security invariants
- Secrets are never retrievable after issuance.
- Every data query is constrained to the credential organization.
- Credential scopes cannot exceed application-approved scopes.
- Suspended applications and revoked or expired credentials are rejected.
- Production rate limiting requires a shared counter store when APIs run across multiple instances.
