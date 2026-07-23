# Milestone 6 Release Notes

## Added

- Durable domain-event outbox
- Event processing and delivery status
- In-app notification center
- Per-user notification preferences
- Email delivery abstraction
- Delivery audit records
- Assignment and comment notifications
- Stale check-in reminders
- At-risk objective alerts
- Notification deduplication
- Notification and preference UI

## Production follow-up

- Replace console email adapter with a transactional provider
- Run background jobs in a dedicated worker process
- Add WebSocket/SSE gateway for immediate badge updates
- Add retry backoff and dead-letter handling
