import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
   const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
   );

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
