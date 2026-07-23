# Identity & User Provisioning

Sprint 14.2 supports SAML/OIDC configuration, SCIM 2.0 user lifecycle endpoints, Microsoft Entra ID, Okta, Google Workspace, and generic SCIM directory connection metadata. Directory synchronization is represented through governed connection, mapping, run, and event records. The generic execution adapter records dry-run/framework runs; provider-specific network adapters are added with native connectors.

Permissions: `identity.read`, `identity.manage`, `identity.execute`, `identity.credentials.manage`.
