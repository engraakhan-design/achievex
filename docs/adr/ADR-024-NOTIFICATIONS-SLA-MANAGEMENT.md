# ADR-024 — Notifications and SLA Management
Status: Accepted

Use the existing Notifications bounded context for channel delivery and templates. Keep SLA policy and clock state in Workflow because targets govern workflow/approval execution. Persist deadlines and escalation records; execute provider delivery through adapters. Do not execute arbitrary recipient expressions or external calls in the SLA transaction.
