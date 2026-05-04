import {
   BadRequestException,
   ConflictException,
   Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

import { PASSWORD_HASH_OPTIONS } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { CreateUserResponse, Roles, UserRole } from './users.types';

@Injectable()
export class UsersService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async createUser(
      grantedBy: string,
      createUserDto: CreateUserDto,
   ): Promise<CreateUserResponse> {
      if (createUserDto.roleIds.length === 0) {
         throw new BadRequestException('At least one role is required');
      }

      const existingUser = await this.prismaService.user.findUnique({
         where: {
            email: createUserDto.email,
         },
         select: {
            id: true,
         },
      });

      if (existingUser) {
         throw new ConflictException('User with this email already exists');
      }

      const roles = await this.prismaService.role.findMany({
         where: {
            id: {
               in: createUserDto.roleIds,
            },
         },
         select: {
            id: true,
            name: true,
         },
      });

      if (roles.length !== createUserDto.roleIds.length) {
         throw new BadRequestException('One or more roles do not exist');
      }

      const roleById = new Map<string, UserRole>(
         roles.map((role) => [role.id, role]),
      );
      const orderedRoles = createUserDto.roleIds.map((roleId) => {
         const role = roleById.get(roleId);

         if (!role) {
            throw new BadRequestException('One or more roles do not exist');
         }

         return role;
      });
      const passwordHash = await argon2.hash(
         createUserDto.password,
         PASSWORD_HASH_OPTIONS,
      );

      try {
         const user = await this.prismaService.$transaction(async (tx) => {
            const createdUser = await tx.user.create({
               data: {
                  email: createUserDto.email,
                  firstName: createUserDto.firstName,
                  lastName: createUserDto.lastName,
                  position: createUserDto.position,
                  passwordHash,
               },
               select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  position: true,
                  createdAt: true,
               },
            });

            await tx.roleAssignment.createMany({
               data: orderedRoles.map((role) => ({
                  userId: createdUser.id,
                  roleId: role.id,
                  grantedBy,
               })),
            });

            return createdUser;
         });

         return {
            user,
            roles: orderedRoles,
         };
      } catch (error) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
         ) {
            throw new ConflictException('User with this email already exists');
         }

         throw error;
      }
   }

   public async findRoles(): Promise<Roles[]> {
      const roles = await this.prismaService.role.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
         },
         orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      });

      return roles;
   }
}
