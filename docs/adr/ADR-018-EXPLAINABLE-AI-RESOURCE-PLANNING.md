# ADR-018: Explainable AI Resource Planning

## Status
Accepted

## Context
Staffing decisions affect delivery commitments, cost, employee workload, and fairness. A language model must not become the system of record for skills, capacity, or assignments.

## Decision
AchieveX calculates deterministic evidence before AI interpretation: required-skill coverage, proficiency, verification, current utilization, available hours, allocation conflicts, and capability gaps. The AI provider explains trade-offs and proposes actions using only tenant-scoped evidence. Recommendations are advisory and never create assignments or alter allocations automatically.

## Consequences
- Recommendations are traceable to source facts.
- Provider output can be evaluated independently from ranking logic.
- Human approval remains mandatory for workforce changes.
- AI generations use the existing telemetry, cost, feedback, and audit foundation.
- Future fairness and bias evaluation can operate on stable recommendation evidence.
