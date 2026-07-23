# Notifications & SLA Management
Sprint 12.4 extends the existing notification inbox and email delivery subsystem with tenant-scoped templates and event routes for IN_APP, EMAIL, SLACK, and TEAMS. External Slack/Teams sends remain adapter-driven and require configured integrations.

The SLA subsystem supports response or completion policies, warning thresholds, due dates, manual processing of due clocks, breach recording, escalation levels, and compliance metrics. The first implementation uses elapsed calendar minutes. `businessHoursOnly` is persisted for the later working-calendar adapter and is not silently treated as implemented.
