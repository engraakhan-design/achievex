# Business Rules Engine

Sprint 12.3 introduces tenant-scoped, immutable rule versions with nested `all`, `any`, and `not` conditions. Published rules can be evaluated in dry-run or execution mode. Action dispatch is recorded as queued intent; downstream domain adapters remain responsible for authorized mutations. Arbitrary JavaScript or SQL execution is intentionally prohibited.
