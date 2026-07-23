# Release Notes — AchieveX Deployment Edition v1.0

## Purpose

Provide a managed-hosting deployment shape for Hostinger Business Web Hosting while preserving the canonical monorepo.

## Added

- one-process Next.js + NestJS runtime;
- Hostinger build and start scripts;
- startup Prisma migration deployment;
- production environment template;
- Hostinger-specific field values and operating guide;
- graceful shutdown and required-secret checks.

## Validation boundary

Source structure, JavaScript syntax, package JSON, archive integrity, and required path presence were checked. Dependency installation, Prisma validation, compilation, migrations against a live PostgreSQL database, and tests were not completed in this environment.
