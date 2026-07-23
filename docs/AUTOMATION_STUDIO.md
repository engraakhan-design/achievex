# Automation Studio

Sprint 12.5 adds versioned, tenant-scoped automations composed of a trigger, optional nested conditions, and allow-listed actions. Published versions are immutable and executions retain the exact version, context, trigger payload, action plan, and outcome.

Supported triggers: domain event, schedule, manual, webhook, SLA breach, approval decision, and rule match. Supported actions: create task, send notification, start workflow, assign user, update field, invoke AI, call webhook, emit event, start SLA, and create approval.

The source implementation creates auditable action plans. Production side effects must be performed by authorized adapters and queue workers. Arbitrary JavaScript, SQL, and shell execution are excluded.
