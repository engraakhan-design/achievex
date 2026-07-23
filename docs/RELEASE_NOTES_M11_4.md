# Release Notes — Milestone 11, Sprint 11.4

## Enterprise Scheduling

Sprint 11.4 adds a time-zone-aware resource scheduling workspace and guarded schedule APIs.

### Delivered
- Resource timeline at `/resources/schedule`
- Working-calendar and holiday administration at `/resources/calendars`
- Allocation rescheduling and reassignment
- Leave and reduced-availability overlays
- Scenario preview API with baseline/proposed conflict comparison
- Pure scheduling functions and tests
- Domain event `resource.allocation_rescheduled`

### API
- `GET /api/v1/resource-management/schedule`
- `PATCH /api/v1/resource-management/allocations/:id/schedule`
- `POST /api/v1/resource-management/schedule/scenarios/preview`

### Safety boundary
Scenario previews do not alter canonical allocations. Changes require an explicit reschedule call and permission `resources.manage`.

### Validation boundary
Full NestJS, Next.js, Prisma Client, and Jest validation requires repository dependencies and Prisma generation.
