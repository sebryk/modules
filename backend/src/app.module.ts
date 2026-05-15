import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionGuard } from './auth/guards/permission.guard';
import { PrismaModule } from './prisma/prisma.module';
import { RbacModule } from './rbac/rbac.module';
import { UsersModule } from './users/users.module';

@Module({
   imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      PrismaModule,
      ApplicationsModule,
      AuthModule,
      RbacModule,
      UsersModule,
   ],
   controllers: [AppController],
   providers: [
      AppService,
      {
         provide: APP_GUARD,
         useClass: JwtAuthGuard,
      },
      {
         provide: APP_GUARD,
         useClass: PermissionGuard,
      },
   ],
})
export class AppModule {}
