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
  
  // Configuración de CORS mejorada
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman)
      if (!origin) return callback(null, true);
      
      // Si allowedOrigins incluye '*', permitir todos
      if (allowedOrigins.includes('*')) return callback(null, true);
      
      // Verificar si el origin está en la lista
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 3600,
  });
  
  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  const PORT: number = Number(process.env.PORT) || 3000;
  
  await app.listen(PORT, '0.0.0.0');
  
  // FIX: Corregir el console.log (estaba con template literal incorrecto)
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});