# Merge Report — Sprint 13.5

Baseline: Sprint 13.4 Decision Intelligence merged archive.

Integrated:
- EnterpriseInsight, InsightAcknowledgement and InsightSubscription models
- Insight enums and organization relationships
- Insights Hub NestJS service/controller/DTO/test
- Analytics module registration
- RBAC permissions and default role mappings
- `/analytics/insights` workspace and navigation
- ADR, guide and release notes

Validation boundary: structural and parser-level checks only. Dependency-backed Prisma validation, builds, migrations and tests remain required.
