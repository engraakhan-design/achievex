# Enterprise Identity and Tenant Administration

Milestone 8 introduces tenant-owned enterprise controls without coupling them to the OKR domain.

## Capabilities

- Central organization settings registry with namespace, version, and actor tracking
- AES-256-GCM encrypted tenant-secret storage abstraction
- Tenant branding and support identity
- Login, password, MFA-foundation, IP/country, and session policies
- Tenant feature-flag overrides with percentage rollout metadata
- Verified domains with discovery, auto-join, and invite-policy fields
- Generic OIDC and SAML identity-provider configuration
- SCIM 2.0 bearer credentials and Users endpoints
- Organization-wide session inventory and revocation
- Compliance retention and data-residency policy records
- Expanded audit history for enterprise administration actions

## Security notes

`TENANT_SECRET_KEY` must be set to a long, random value in every deployed environment. The built-in encrypted secret store is an application abstraction; production deployments should replace the key source with a cloud KMS or Vault-managed envelope key.

SCIM tokens and identity-provider client secrets are displayed only when created. SCIM tokens are stored as SHA-256 hashes. Identity-provider secrets and certificates are encrypted before persistence.

The current domain verification action supports a manual development flow. Production verification should resolve the emitted DNS TXT value and only mark a domain verified after authoritative DNS confirmation.

## SCIM endpoints

- `GET /api/v1/scim/v2/ServiceProviderConfig`
- `GET /api/v1/scim/v2/Users`
- `GET /api/v1/scim/v2/Users/:id`
- `POST /api/v1/scim/v2/Users`
- `PATCH /api/v1/scim/v2/Users/:id`

SCIM requests require `Authorization: Bearer ax_scim_...`.

## Administration endpoints

All routes below require `organization.manage`:

- `/api/v1/enterprise/branding`
- `/api/v1/enterprise/security-policy`
- `/api/v1/enterprise/compliance`
- `/api/v1/enterprise/feature-flags`
- `/api/v1/enterprise/settings`
- `/api/v1/enterprise/domains`
- `/api/v1/enterprise/identity-providers`
- `/api/v1/enterprise/sessions`
- `/api/v1/enterprise/scim-tokens`
- `/api/v1/enterprise/audit`

## Deliberate foundation boundaries

OIDC authorization-code exchange, SAML assertion validation, MFA enrollment, geographic IP resolution, and DNS verification require provider-specific libraries and production credentials. This milestone supplies their tenant-safe configuration, secret, policy, audit, and administration foundations. Provider runtime adapters should be implemented behind these contracts.
