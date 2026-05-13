import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { registerCookiePlugin } from './auth/auth-cookie';
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
   const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
   );

   await registerCookiePlugin(app);

   app.enableCors({
      origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
      credentials: true,
   });

   app.enableShutdownHooks();
   app.useGlobalPipes(
      new ValidationPipe({
         whitelist: true,
         transform: true,
      }),
   );

   await app.listen(3000, '0.0.0.0');
};

void bootstrap();
