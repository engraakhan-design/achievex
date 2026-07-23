# Resource Management

Sprint 11.1 introduces the Resource Management bounded context. Execution owns work and delivery; Resource Management owns workforce capacity, skills, teams, calendars, and staffing allocations.

## Core entities

- Resource
- Resource Team and Membership
- Skill and Resource Skill
- Resource Allocation
- Working Calendar
- Holiday Calendar
- Availability Exception

## Capacity baseline

Capacity is represented as hours per week. Allocation can be entered as a percentage or explicit weekly hours. Utilization and overallocation are calculated from active and planned allocations. More detailed weekly and monthly time-phased capacity belongs to Sprint 11.2.

## API

Base route: `/api/v1/resource-management`

Read access requires `resources.read`; changes require `resources.manage`.

## Sprint 11.2 — Capacity Planning

Capacity planning is available at `/resources/capacity` and through:

- `GET /api/v1/resource-management/capacity`
- `GET /api/v1/resource-management/capacity/conflicts`
- `GET|POST /api/v1/resource-management/holiday-calendars`
- `PATCH /api/v1/resource-management/calendars/:id`
- `POST /api/v1/resource-management/resources/:id/availability-exceptions`

Queries accept `from`, `to`, `granularity`, and optional `teamId` or `resourceId` filters.

## Sprint 11.3 — AI Resource Planner

The AI Resource Planner ranks staffing candidates using deterministic skill coverage, proficiency, verification, utilization, and available-capacity evidence. It also identifies capability gaps, produces hiring signals, suggests workload rebalancing, and drafts executive workforce summaries. Recommendations are advisory and do not modify allocations.

## Sprint 11.4 — Enterprise Scheduling

Enterprise scheduling adds a resource timeline, allocation rescheduling, leave visibility, calendar administration, and reversible scenario previews.

Routes:
- `/resources/schedule`
- `/resources/calendars`

The scheduling API is time-zone aware at the response boundary and relies on resource or tenant calendars for availability calculations. A scenario preview never writes allocation data. Canonical changes require `resources.manage` and emit `resource.allocation_rescheduled`.

## Sprint 11.5 — Executive Workforce Analytics

The workforce analytics workspace at `/resources/analytics` combines horizon-based capacity and allocation demand with team membership, skill proficiency, verification, and recorded hourly cost rates. It highlights bottlenecks, bench opportunities, scarce capabilities, hiring signals, and team workload. Derived classifications are advisory read-model outputs and never change allocations or resource records.
