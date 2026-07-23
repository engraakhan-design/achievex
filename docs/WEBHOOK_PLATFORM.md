# Webhook Platform Guide

Headers: `X-AchieveX-Event-ID`, `X-AchieveX-Delivery-ID`, `X-AchieveX-Event-Type`, `X-AchieveX-Timestamp`, `X-AchieveX-Signature`, and `X-AchieveX-Attempt`. Verify the signature against the unmodified request body and reject stale timestamps. Delivery retries use exponential backoff capped at 24 hours. Dead-lettered deliveries require an active subscription before replay.
