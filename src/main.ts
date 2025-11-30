import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Servir archivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads/aboutme'), {
    prefix: '/uploads/aboutme/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads/projects'), {
    prefix: '/uploads/projects/',
  });

  // CORS: permite dominios de FRONTEND_URL separados por coma
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : '*';

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT) || 3000;

  // Cuando es Railway => bind 0.0.0.0
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
}

bootstrap();
