# ADR-028: Predictive Analytics Architecture

## Decision
Implement predictive analytics as a governed sub-context of Analytics. Operational domains remain authoritative; prediction services consume prepared time series and features and persist auditable results.

## Rationale
Transparent statistical models provide explainable baseline forecasts without introducing opaque code execution or overstating model capability. Immutable model versions preserve reproducibility.

## Consequences
Prediction quality depends on source-data quality and sufficient history. Confidence is a bounded heuristic, not certainty. Advanced ML requires additional model validation, monitoring, and governance controls.
