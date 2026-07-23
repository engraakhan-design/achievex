# Enterprise Event Bus Specification

Events use `{eventId,eventType,organizationId,source,occurredAt,payload,metadata}`. Event names follow `domain.action` notation. Consumers must be idempotent and preserve tenant boundaries and correlation identifiers.
