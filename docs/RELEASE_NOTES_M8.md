# Milestone 8 Release Notes

Milestone 8 adds enterprise identity and tenant administration foundations.

Highlights include tenant branding, login and session policy, feature flags, verified domains, provider-neutral OIDC/SAML configuration, encrypted tenant secrets, SCIM token management and Users provisioning endpoints, organization-wide session administration, compliance retention controls, and enhanced audit events.

New UI route: `/settings/enterprise`.

Before deployment, set `TENANT_SECRET_KEY`, apply the `20260722_enterprise_identity_admin` migration, and generate Prisma Client.
