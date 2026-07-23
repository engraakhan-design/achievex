import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'], credentials: true });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  const config = new DocumentBuilder()
    .setTitle('AchieveX API')
    .setDescription('API for the AchieveX OKR platform')
    .setVersion('1.0.0-rc.1')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`AchieveX API: http://localhost:${port}/api/v1`);
  console.log(`Swagger: http://localhost:${port}/docs`);
}
bootstrap();
