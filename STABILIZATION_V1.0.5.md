# AchieveX Stabilization v1.0.5

## Shared types build isolation

The Hostinger v1.0.4 build confirmed that Prisma Client generation succeeds and the Next.js application compiles. The remaining failure came from incompatible third-party declaration files loaded while compiling `@achievex/types`.

Changes:

- Enabled `skipLibCheck` only in `packages/types/tsconfig.json` so external declaration packages do not block compilation of AchieveX-owned types.
- Added `types: []` to prevent unrelated ambient type packages from being injected into the shared types project.
- Pinned the package-local TypeScript version to `5.9.3`, matching the root toolchain.
- Updated application release versions to `1.0.5`.

This does not disable strict checking of source files under `packages/types/src`; it only suppresses compatibility checking inside dependency `.d.ts` files.
