# ADR-051 — Enterprise API and Developer Platform

## Status
Accepted for Sprint 18.1.

## Decision
AchieveX exposes stable tenant-aware contracts under `/api/public/v1`. External callers authenticate with one-time application credentials whose secrets are hashed at rest. Authentication is necessary but insufficient: active application status, credential expiry, explicit scopes, optional resource grants, and rate-limit policy are evaluated before domain access.

API request logs store operational metadata only. Request and response bodies, authorization headers, raw credentials, and sensitive personal content are excluded. Correlation IDs and idempotency keys provide traceability and safe retry foundations.

The older `/v2` foundation remains available for compatibility but is not the Milestone 18 public contract.
