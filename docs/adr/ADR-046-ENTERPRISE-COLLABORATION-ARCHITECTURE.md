# ADR-046: Enterprise Collaboration Architecture

## Decision
AchieveX uses a tenant-scoped collaboration bounded context for conversations, participants, messages, reactions, and activity events. Business records are linked by typed identifiers rather than tight foreign-key coupling, allowing every domain to embed discussions.

## Security
Every read and write verifies organization scope and conversation membership. Activity audiences are explicit; empty audiences mean organization-visible. Attachments remain delegated to the existing secure file infrastructure.
