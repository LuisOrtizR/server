import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Crear carpetas de uploads si no existen
  const uploadBase = join(process.cwd(), 'uploads');
  const uploadDirs = ['aboutme', 'projects'].map(folder =>
    join(uploadBase, folder),
  );

  uploadDirs.forEach(dir => {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  });

  // Servir assets estáticos
  uploadDirs.forEach(folder => {
    const relative = folder.split('uploads')[1].replace(/\\/g, '/');
    app.useStaticAssets(folder, {
      prefix: `/uploads${relative}/`,
    });
  });

  // CORS seguro y flexible
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some(allowed =>
        allowed === '*' || new RegExp(`^${allowed.replace(/\*/g, '.*')}$`).test(origin),
      );
      isAllowed
        ? callback(null, true)
        : callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Puerto seguro (Railway / Render)
  const PORT = Number(process.env.PORT ?? 8080);
  await app.listen(PORT, '0.0.0.0');

  const url = await app.getUrl();
  console.log(`🚀 Server running on: ${url}`);
  console.log(`📁 Uploads available: ${url}/uploads/*`);
  console.log(`🌍 CORS allowed origins:`, allowedOrigins);
}

bootstrap();
