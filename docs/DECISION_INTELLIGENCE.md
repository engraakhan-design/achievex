# Decision Intelligence

Sprint 13.4 adds governed recommendation policies, immutable versions, evidence-backed recommendations, human disposition history, and side-effect-free scenario simulation. Recommendations are advisory and never mutate operational domains directly.

## Governance
- Published policy versions are immutable.
- Generation is blocked below the policy confidence threshold.
- Evidence, expected impact, alternatives, rationale and proposed actions are persisted.
- Accept, reject, defer and mark-applied decisions are append-only records.
- Simulations use deterministic deltas and make no causal claim.
