import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
   public getHello(): { message: string } {
      return {
         message: 'NestJS with Fastify and Prisma is ready',
      };
   }
}
