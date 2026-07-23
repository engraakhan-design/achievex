# Workflow Engine Developer Guide

## Lifecycle
1. Create a definition.
2. Save a new version containing steps and transitions.
3. Validate and publish the latest version.
4. Start an instance against the published version.
5. Complete user or approval tasks.
6. Evaluate the first matching transition by ascending priority.
7. Record every material execution event in workflow history.

## Initial step types
`START`, `USER_TASK`, `APPROVAL`, `DECISION`, `NOTIFICATION`, `AI_ACTION`, `WEBHOOK`, and `END`.

Sprint 12.1 executes human waiting steps directly. Automatic action workers are represented in the model but should be wired to the queue/event infrastructure in subsequent sprints.

## Permissions
- `workflow.read`
- `workflow.manage`
- `workflow.publish`
- `workflow.execute`

## API
- `GET /api/v1/workflow/definitions`
- `POST /api/v1/workflow/definitions`
- `POST /api/v1/workflow/definitions/:id/versions`
- `POST /api/v1/workflow/definitions/:id/publish`
- `POST /api/v1/workflow/instances`
- `GET /api/v1/workflow/instances/:id`
- `POST /api/v1/workflow/tasks/:id/complete`
- `GET /api/v1/workflow/history/:instanceId`
