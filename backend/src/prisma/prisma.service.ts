import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { createPrismaClientOptions } from './prisma-client-options';

@Injectable()
export class PrismaService
   extends PrismaClient
   implements OnModuleInit, OnModuleDestroy
{
   public constructor() {
      super(createPrismaClientOptions());
   }

   public async onModuleInit(): Promise<void> {
      await this.$connect();
   }

   public async onModuleDestroy(): Promise<void> {
      await this.$disconnect();
   }
}
