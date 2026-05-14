import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';

@Module({
   controllers: [UsersController, RolesController],
   providers: [UsersService, RolesService],
})
export class UsersModule {}
