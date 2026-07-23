# AchieveX Deployment Edition v1.0.1

Fixes incorrect AdminShell relative imports in:

- `apps/web/app/settings/developer-platform/page.tsx`
- `apps/web/app/settings/webhooks/page.tsx`

The imports now resolve to `apps/web/components/admin-shell.tsx`.
