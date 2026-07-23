# ADR-047: Real-Time Collaboration Architecture

## Decision
Use a Socket.IO gateway under `/collaboration`, backed by durable Prisma state for presence, receipts, and collaboration sessions. Ephemeral typing state is broadcast with an eight-second expiry and is not persisted.

## Boundaries
Socket authentication currently consumes organization and user identity from the authenticated handshake contract. Production deployment must connect this to signed access tokens and use a shared pub/sub adapter for horizontal scaling. REST equivalents remain available for testing and degraded operation.
