# Connector SDK

Implement `EnterpriseConnector` for authenticate, validate, testConnection, healthCheck, pull, push, subscribe, unsubscribe, handleWebhook and disconnect. Connector versions are immutable once published. Return structured `ConnectorResult` values and mark only transient failures retryable.
