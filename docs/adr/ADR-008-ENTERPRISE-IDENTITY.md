# ADR-008: Provider-Neutral Enterprise Identity

## Decision

OIDC and SAML providers share a tenant-owned identity-provider aggregate. Provider-specific runtime adapters will consume this normalized configuration.

## Rationale

Microsoft Entra ID, Okta, Google Workspace, OneLogin, Ping Identity, Auth0, and generic providers should not create separate domain models. Provider neutrality keeps policy, JIT provisioning, domains, secrets, audit, and administration consistent.
