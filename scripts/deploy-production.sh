#!/usr/bin/env sh
set -eu

[ -f .env.production ] || { echo "Missing .env.production" >&2; exit 1; }

docker compose --env-file .env.production -f docker-compose.production.yml build
docker compose --env-file .env.production -f docker-compose.production.yml up -d postgres redis
docker compose --env-file .env.production -f docker-compose.production.yml run --rm migrate
docker compose --env-file .env.production -f docker-compose.production.yml up -d api web nginx
docker compose --env-file .env.production -f docker-compose.production.yml ps
