# AchieveX Deployment Edition v1.0

This edition adapts the AchieveX monorepo to managed Node hosting that accepts one build command, one output directory, and one entry file.

## Commands

```bash
npm install
npm run hostinger:build
npm run hostinger:start
```

## Hostinger values

```text
Build command: npm run hostinger:build
Package manager: npm
Output directory: .
Entry file: hostinger-server.js
```

See `docs/deployment/HOSTINGER_BUSINESS_DEPLOYMENT.md` for setup and environment variables.
