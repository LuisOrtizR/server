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

  // CORS dinámico (acepta frontend separado por coma en .env)
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : '*';

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Puerto seguro con fallback
  const PORT: number = Number(process.env.PORT) || 3000;

  // Compatible con Railway, Render, Docker, local, etc.
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
}

bootstrap();
