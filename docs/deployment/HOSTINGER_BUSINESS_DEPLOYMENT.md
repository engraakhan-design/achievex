# AchieveX Deployment Edition v1.0 — Hostinger Business Web Hosting

## Hostinger form values

- Framework preset: Other
- Branch: main
- Node version: 22.x
- Root directory: ./
- Build command: npm run hostinger:build
- Package manager: npm
- Output directory: .
- Entry file: hostinger-server.js

## Required environment variables

Add at minimum:

- NODE_ENV=production
- DATABASE_URL=<managed PostgreSQL connection string with SSL>
- JWT_SECRET=<64+ random characters>
- CORS_ORIGIN=https://achievex.me,https://www.achievex.me
- NEXT_PUBLIC_API_URL=https://achievex.me/api/v1
- SKIP_DATABASE_MIGRATIONS=false

Do not add PORT unless Hostinger support explicitly asks; the platform normally injects it.

## External services

Business Web Hosting does not provide the full Docker Compose stack. Use:

1. Managed PostgreSQL (for example Supabase, Neon, or another PostgreSQL provider)
2. Managed Redis when queue/cache/realtime features are enabled
3. S3-compatible object storage when document uploads are enabled

## Runtime behavior

`hostinger-server.js`:

1. validates critical environment variables;
2. applies `prisma migrate deploy` unless disabled;
3. boots the compiled NestJS API;
4. mounts the Next.js frontend on the same process and port;
5. handles graceful shutdown.

## Verification

After deployment, check:

- `/`
- `/api/v1/health`
- `/docs`

Review Hostinger build logs if any endpoint fails.
