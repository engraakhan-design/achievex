# AchieveX deployment on achievex.me

## Release topology

- `nginx`: TLS termination and reverse proxy
- `web`: Next.js application on port 3000, private to Docker
- `api`: NestJS API on port 3001, private to Docker
- `postgres`: PostgreSQL 17, private network only
- `redis`: Redis 7 with authentication, private network only

## Server prerequisites

Use Ubuntu 24.04 LTS or an equivalent current Linux distribution with:

- 4 vCPU minimum for demonstration; 8 vCPU recommended
- 8 GB RAM minimum; 16 GB recommended
- 80 GB SSD minimum
- Docker Engine and Docker Compose v2
- inbound TCP 22, 80 and 443 allowed

## DNS

Create these records at the DNS provider:

| Type | Name | Value |
|---|---|---|
| A | `@` | server public IPv4 |
| A | `www` | server public IPv4 |
| A | `staging` | staging server public IPv4 |

Use a staging server first. Do not point the production records until validation succeeds.

## Installation

```bash
sudo mkdir -p /opt/achievex
sudo chown "$USER":"$USER" /opt/achievex
cd /opt/achievex
git clone YOUR_GITHUB_REPOSITORY_URL .
cp .env.production.example .env.production
chmod 600 .env.production
```

Generate production secrets, for example:

```bash
openssl rand -base64 48
```

Replace every `GENERATE_...` value in `.env.production`.

## First HTTP startup and TLS issuance

The supplied Nginx production configuration expects an existing certificate. For the first certificate issuance:

1. Temporarily run an HTTP-only Nginx configuration or use Certbot standalone mode.
2. Stop anything using port 80.
3. Run:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml run --rm --service-ports certbot certonly \
  --standalone \
  --email YOUR_EMAIL_ADDRESS \
  --agree-tos \
  --no-eff-email \
  -d achievex.me -d www.achievex.me
```

For staging, request `staging.achievex.me` separately on the staging host.

## Deployment

```bash
./scripts/deploy-production.sh
```

## Verification

```bash
curl -fsS https://achievex.me/api/v1/health
curl -I https://achievex.me
curl -I https://www.achievex.me

docker compose --env-file .env.production -f docker-compose.production.yml ps
docker compose --env-file .env.production -f docker-compose.production.yml logs --tail=200 api web nginx
```

## Backups

At minimum, schedule daily encrypted PostgreSQL dumps and test restoration. Persistent Docker volumes alone are not backups.

## Release process

1. Build and validate in CI.
2. Deploy to `staging.achievex.me`.
3. Run smoke tests and migration verification.
4. Tag the release.
5. Back up production.
6. Deploy to `achievex.me`.
7. Confirm health, login, API, WebSocket and critical business flows.
