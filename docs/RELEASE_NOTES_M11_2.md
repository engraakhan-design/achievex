# Release Notes — Milestone 11, Sprint 11.2

## Capacity Planning

Sprint 11.2 adds time-phased workforce capacity planning across resources and teams.

### Delivered

- Weekly and monthly capacity periods
- Working-calendar-adjusted capacity
- Holiday-calendar association
- Availability exceptions and leave adjustments
- Allocation overlap calculations
- Demand-versus-capacity forecasting
- Utilization heat maps
- Overallocation and underutilization states
- Team and resource filters
- Allocation conflict ranking
- Capacity planning UI at `/resources/capacity`
- Pure calculation tests

### Important behavior

Capacity calculations use working days and hours per day, subtract holidays, apply availability exceptions, and include only allocations overlapping each period. Overallocated periods exceed 100% utilization; underutilized periods are below 60%.
