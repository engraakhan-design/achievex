# AchieveX API Platform

Sprint 14.5 provides REST v2 endpoints for objectives, projects, and metric definitions; an OpenAPI 3.1 manifest; a GraphQL schema foundation; API applications and one-time credentials; API products and versions; usage records; SDK generation plans; and marketplace visibility.

## Required production controls
Use a gateway for TLS termination, quotas, rate limiting, WAF rules, request-size limits, scope enforcement, and usage ingestion. Store no plaintext API secrets. Enable credential rotation and emergency revocation. GraphQL requires persisted queries and complexity controls before activation.
