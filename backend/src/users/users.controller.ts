import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   ParseUUIDPipe,
   Put,
   Post,
   Query,
   Req,
} from '@nestjs/common'
import type { AuthenticatedRequest } from '../common/types/api'

import { RequirePermission } from '../auth/decorators/require-permission.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ReplaceUserRolesDto } from '../rbac/dto/replace-user-roles.dto'
import { UsersService } from './users.service'
import type { User } from './users.types'

@Controller('users')
export class UsersController {
   public constructor(private readonly usersService: UsersService) {}

   @Get()
   @RequirePermission('user:read')
   public async findAll(@Query('include') include?: string): Promise<{ data: User[] }> {
      const queries = include?.split(',') ?? []
      const users = await this.usersService.findAll({
         withRoleAssigments: queries.includes('role-assignment'),
      })
      return { data: users }
   }

   @Get(':id')
   @RequirePermission('user:read')
   public async findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ data: User }> {
      const user = await this.usersService.findById(id)
      return { data: user }
   }

   @Post()
   @RequirePermission('user:create')
   public async create(
      @Body() createUserDto: CreateUserDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<{ data: User }> {
      const user = await this.usersService.createUser(request.user.id, createUserDto)
      return { data: user }
   }

   @Put(':id')
   @RequirePermission('user:update')
   public async update(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() updateUserDto: UpdateUserDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<{ data: User }> {
      const user = await this.usersService.updateUser(id, request.user.id, updateUserDto)
      return { data: user }
   }

   @Delete(':id')
   @RequirePermission('user:delete')
   public async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
      await this.usersService.deleteUser(id)
   }

   @Put(':id/roles')
   @RequirePermission('role:assign')
   public async replaceRoles(
      @Param('id', new ParseUUIDPipe()) id: string,
      @Body() replaceUserRolesDto: ReplaceUserRolesDto,
      @Req() request: AuthenticatedRequest,
   ): Promise<{ data: User }> {
      const user = await this.usersService.replaceUserRoles(
         id,
         request.user.id,
         replaceUserRolesDto,
      )

      return { data: user }
   }
}
