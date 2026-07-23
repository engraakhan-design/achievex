# ADR-032: Identity and Provisioning Architecture

## Decision
Extend the existing enterprise SAML/OIDC and SCIM foundation with tenant-scoped directory connections, mappings, auditable sync runs, and append-only provisioning events. Authentication and provisioning remain separate trust boundaries.

## Safety
Secrets are never returned by read APIs. Deprovisioning is opt-in. Preview is side-effect free. Production secrets require KMS-backed encryption.
