# AchieveX Architecture

## Decision
Phase 1 uses a modular monolith: one Next.js web app, one NestJS API, one PostgreSQL database, and Redis. Domain modules remain isolated so high-load capabilities can be extracted later without paying microservice complexity during MVP development.

## Tenant isolation
All tenant-owned records carry `organizationId`. API services must derive it from the authenticated session, never from an untrusted request body. Every tenant query must include it.

## Planned modules
1. Identity and authentication
2. Organizations, departments, teams and users
3. Objectives, key results and check-ins
4. Dashboards and reporting
5. Notifications and integrations

## API conventions
- Prefix: `/api/v1`
- OpenAPI UI: `/docs`
- Validation: global whitelist and transformation
- Errors: RFC 9457 problem details will be introduced with authentication
