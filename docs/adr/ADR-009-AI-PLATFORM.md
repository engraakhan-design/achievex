# ADR-009: Provider-neutral AI platform

## Decision

AI capabilities depend on an internal `AiProvider` contract rather than directly importing a model vendor SDK. Every generation persists provider, model, prompt version, request context, response, tokens, latency, estimated cost, and feedback.

## Rationale

This avoids vendor lock-in, supports enterprise hosting choices, enables cost governance, and creates the evidence required for evaluation and incident review.

## Consequences

Provider-specific features must be normalized behind the contract. Structured-output validation and tenant-specific provider routing remain future hardening work.
