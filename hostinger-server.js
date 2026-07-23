'use strict';

const http = require('node:http');
const { execFileSync } = require('node:child_process');
const express = require('express');
const next = require('next');
const helmet = require('helmet');
const { ValidationPipe } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function migrate() {
  if (process.env.SKIP_DATABASE_MIGRATIONS === 'true') return;
  console.log('[AchieveX] Applying Prisma migrations...');
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
    { stdio: 'inherit', env: process.env },
  );
}

async function start() {
  required('DATABASE_URL');
  required('JWT_SECRET');
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';

  migrate();

  const port = Number(process.env.PORT || 3000);
  const hostname = process.env.HOST || '0.0.0.0';
  const dev = process.env.NODE_ENV !== 'production';
  const web = next({ dev, dir: './apps/web', hostname, port });
  await web.prepare();

  const expressApp = express();
  const { AppModule } = require('./apps/api/dist/app.module.js');
  const api = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['log', 'error', 'warn'] },
  );

  api.use(helmet({ contentSecurityPolicy: false }));
  api.enableCors({
    origin: (process.env.CORS_ORIGIN || 'https://achievex.me')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });
  api.setGlobalPrefix('api/v1');
  api.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AchieveX API')
    .setDescription('API for the AchieveX enterprise execution platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', api, SwaggerModule.createDocument(api, swaggerConfig));

  await api.init();

  const nextHandler = web.getRequestHandler();
  expressApp.use((req, res) => nextHandler(req, res));

  const server = http.createServer(expressApp);
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  server.listen(port, hostname, () => {
    console.log(`[AchieveX] Web: http://${hostname}:${port}`);
    console.log(`[AchieveX] API: http://${hostname}:${port}/api/v1`);
    console.log(`[AchieveX] Health: http://${hostname}:${port}/api/v1/health`);
    console.log(`[AchieveX] Swagger: http://${hostname}:${port}/docs`);
  });

  const shutdown = async (signal) => {
    console.log(`[AchieveX] ${signal} received; shutting down...`);
    server.close(async () => {
      await api.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 15_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('[AchieveX] Startup failed:', error);
  process.exit(1);
});
