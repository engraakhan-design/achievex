# ADR-055 — Integration Marketplace, Governance and Operations

## Decision
AchieveX will use a tenant-aware marketplace control plane for connector packages, API applications, webhook applications, and automation templates. Draft listings require independent review before publication. Installation creates a durable tenant-scoped record with configuration, installed version, health, and uninstall lifecycle. Ratings require an active installation. Certifications and incidents are first-class auditable records.

## Security boundary
Marketplace approval is not runtime trust. Runtime systems must continue to enforce API scopes, encrypted credentials, connector allow-lists, outbound egress controls, webhook signing, workflow adapter policies, and least privilege.

## Consequences
The platform gains governed discovery and operations while keeping provider code and package execution outside the marketplace service. Production package verification, malware scanning, SBOM validation, signature verification, and sandboxing remain deployment responsibilities.
