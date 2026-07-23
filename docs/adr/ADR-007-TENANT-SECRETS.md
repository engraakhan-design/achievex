# ADR-007: Tenant Secret Abstraction

## Decision

Enterprise credentials reference a centralized tenant-secret record rather than storing plaintext in feature tables.

## Rationale

This prevents secret handling from spreading across identity, integrations, email, and AI modules. The development implementation uses AES-256-GCM. The service boundary is designed for later envelope encryption using AWS KMS, Azure Key Vault, Google Cloud KMS, or HashiCorp Vault.
