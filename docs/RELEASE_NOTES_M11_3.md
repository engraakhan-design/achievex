# Release Notes — Milestone 11, Sprint 11.3

## AI Resource Planner

This sprint adds explainable staffing recommendations, skill-gap analysis, allocation-conflict resolution guidance, hiring signals, and executive workforce summaries.

### API capabilities
- `POST /api/v1/ai/resources/staffing-recommendations`
- `POST /api/v1/ai/resources/conflicts/resolve`
- `POST /api/v1/ai/resources/skill-gaps`
- `POST /api/v1/ai/resources/workforce-summary`

### Governance
All recommendations are tenant-scoped, recorded in `AiGeneration`, and advisory. No assignment or allocation is changed without an explicit user workflow.

### UI
The new `/resources/assistant` workspace supports staffing, skill gaps, conflict resolution, and workforce-summary generation.
