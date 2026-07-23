# Approval Engine

Sprint 12.2 adds reusable approval orchestration for projects, budgets, OKRs, resource allocations, risks, and change requests.

## Strategies
SINGLE, SEQUENTIAL, PARALLEL, MAJORITY, CONSENSUS, FIRST_RESPONSE. Requests contain ordered stages; each stage contains one or more assignments. Decisions are immutable records.

## API
- POST/GET `/api/v1/workflow/approvals`
- GET `/api/v1/workflow/approvals/dashboard`
- GET `/api/v1/workflow/approvals/:id`
- POST `/api/v1/workflow/approvals/:id/approve|reject|request-changes|decide`
- POST `/api/v1/workflow/approvals/:id/escalations`
- POST/GET `/api/v1/workflow/delegations`
