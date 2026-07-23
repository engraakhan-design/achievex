# Notifications and Domain Events

Milestone 6 introduces a durable event outbox and user notification system.

## Architecture

Business actions append immutable `DomainEvent` records in the same application database. A background processor claims pending events and translates relevant events into notifications. This outbox-style design avoids losing events during process restarts and can later be connected to BullMQ, Kafka, SNS/SQS, or another broker without changing domain services.

## Notification channels

- In-app notifications stored in PostgreSQL
- Email through an injectable provider abstraction
- Delivery records for each attempted channel

The development email adapter logs deliveries. Replace `EmailProvider` with SES, SendGrid, Postmark, or SMTP for production.

## Automated jobs

The worker runs every 15 minutes and performs:

- Domain event processing
- Stale key-result check-in reminders
- Objective risk alerts
- Notification deduplication

Set `NOTIFICATION_JOBS_ENABLED=false` for API instances that should not run background work. In production, run one dedicated worker replica.

## Security

All notification reads and writes are scoped to both organization and authenticated user. Tenant identifiers are never accepted from clients. Event history requires `okrs.read` permission in the current milestone.

## API

- `GET /api/v1/notifications`
- `PATCH /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/read-all`
- `DELETE /api/v1/notifications/:id`
- `GET /api/v1/notifications/preferences/me`
- `PATCH /api/v1/notifications/preferences/me`
- `GET /api/v1/events`
