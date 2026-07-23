# Predictive Analytics

Sprint 13.3 adds governed predictive analytics to AchieveX. Prediction models and versions are tenant-scoped. Published versions are immutable and every run records its exact inputs, outputs, status, and explanation.

## Initial models
- Linear trend using ordinary least squares
- Moving average
- Simple exponential smoothing
- Weighted logistic risk score

The initial catalogue is intentionally transparent. It does not claim causal inference or advanced machine-learning accuracy. Confidence values describe fit/stability heuristics and must not be treated as guarantees.

## Governance
- No arbitrary Python, JavaScript, SQL, or shell execution
- Minimum sample validation
- Dry-run support
- Immutable published versions
- Exact model/version lineage
- Feature contribution explanations for risk scores
- Tenant-scoped results and histories

## Production extension
External ML providers may be connected later through a provider interface, with model registry, validation datasets, drift monitoring, fairness review, and approval gates.
