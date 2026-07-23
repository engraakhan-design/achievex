# ADR-035: Enterprise API Platform

## Decision
AchieveX exposes external capabilities through versioned API products. REST v2 is the first executable public surface. GraphQL is introduced as a schema-first foundation and must use persisted queries, complexity limits, tenant-aware resolvers, and the same authorization policy before production activation.

Application secrets are generated once, stored only as hashes, scoped, revocable, and attributable. OpenAPI 3.1 is the source contract for documentation and SDK generation. SDKs are generated in CI rather than dynamically by the API process.

## Consequences
API lifecycle, products, versions, credentials, and usage become auditable first-class resources. Live gateway enforcement, distributed rate limits, billing, and production GraphQL execution remain deployment concerns.
