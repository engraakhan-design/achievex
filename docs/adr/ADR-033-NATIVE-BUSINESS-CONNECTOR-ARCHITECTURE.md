# ADR-033: Native Business Connector Architecture

## Decision
Implement provider-specific adapters behind one normalized business-connector contract. Persist profiles, explicit mappings, item identities, checksums and conflicts separately from operational domain records.

## Rationale
Provider payloads differ substantially. Normalization prevents Jira, GitHub or ServiceNow schemas from leaking into AchieveX business domains while preserving source traceability.

## Governance
Preview is side-effect free. Sync is idempotent by profile, object type and external ID. Conflicts are never silently discarded. Network clients and OAuth refresh flows remain connector-specific deployment components.
