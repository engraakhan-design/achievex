# AchieveX Deployment Edition v1.0.2 — Build Stabilization

This release addresses the production compilation failures observed on Hostinger.

## Corrections

- Pins TypeScript to 5.9.3 rather than an unbounded `latest` TypeScript 6 release.
- Pins Prisma CLI and client to the same 6.16.3 release.
- Makes the root build regenerate Prisma Client before Turbo builds any workspace.
- Adds an explicit API `rootDir` and removes accidental TypeScript 6 strictness escalation.
- Resolves duplicate Prisma schema declarations introduced by the legacy and developer-platform webhook implementations.
- Keeps both webhook implementations by renaming the original implementation to `LegacyWebhookSubscription` / `LegacyWebhookDelivery` and updating only its service delegates.
- Aligns AI workforce helper types with the candidate evidence returned by the API.
- Retains the corrected frontend `AdminShell` imports from v1.0.1.

## Hostinger build setting

Use:

```text
npm run build
```

The `build` script now runs `prisma generate` automatically, so `npm run hostinger:build` is also valid but no longer required.

## Verification boundary

The package has been statically checked in the artifact environment. Full dependency installation could not be completed in that environment because npm network installation timed out. The authoritative validation remains the Hostinger build log.
