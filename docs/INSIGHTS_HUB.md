# Enterprise Insights Hub

Sprint 13.5 introduces a tenant-scoped attention layer over analytics, predictions and decision recommendations.

## Sources

- Metric snapshots and future anomaly detectors
- Prediction results
- Decision recommendations
- Manual and system-generated insights

## Prioritization

Insights carry severity, score, confidence, impact, evidence, tags, entity context and lifecycle status. The hub never changes the source analytical record.

## Lifecycle

`NEW -> ACKNOWLEDGED -> IN_REVIEW -> RESOLVED | DISMISSED | EXPIRED`

Each human update creates an append-only acknowledgement record.

## Subscriptions

Users can save filters and choose immediate, daily or weekly delivery through configured channels. This sprint persists subscriptions; actual digest dispatch belongs to the notification worker integration.

## Refresh

The refresh endpoint idempotently projects persisted prediction results and active decision recommendations into insights using source uniqueness.
