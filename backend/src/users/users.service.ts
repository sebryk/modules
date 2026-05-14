import {
   BadRequestException,
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

import { PASSWORD_HASH_OPTIONS } from '../auth/auth.constants';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { Role, User } from './users.types';

const userWithRolesSelect = {
   id: true,
   email: true,
   firstName: true,
   lastName: true,
   position: true,
   createdAt: true,
} satisfies Prisma.UserSelect;

const roleAssignmentsSelect = {
   roleAssignments: {
      select: {
         grantedBy: true,
         createdAt: true,
         role: {
            select: {
               id: true,
               name: true,
               description: true,
               isSystem: true,
            },
         },
      },
      orderBy: {
         role: {
            name: 'asc',
         },
      },
   },
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
   public constructor(private readonly prismaService: PrismaService) {}

   public async findAll({ withRoleAssigments = false } = {}): Promise<User[]> {
      const users = await this.prismaService.user.findMany({
         select: {
            ...userWithRolesSelect,
            ...(withRoleAssigments && roleAssignmentsSelect),
         },
         orderBy: {
            createdAt: 'desc',
         },
      });

      return users;
   }

   public async findById(id: string): Promise<User> {
      const user = await this.prismaService.user.findUnique({
         where: {
            id,
         },
         select: userWithRolesSelect,
      });

      if (!user) {
         throw new NotFoundException(`User with id ${id} not found`);
      }

      return user;
   }

   public async createUser(
      grantedBy: string,
      createUserDto: CreateUserDto,
   ): Promise<User> {
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
            description: true,
            isSystem: true,
         },
      });

      if (roles.length !== createUserDto.roleIds.length) {
         throw new BadRequestException('One or more roles do not exist');
      }

      const roleById = new Map<string, Role>(
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
            ...user,
            roleAssignments: orderedRoles.map((role) => ({
               role,
               grantedBy,
               createdAt: user.createdAt,
            })),
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

   public async deleteUser(id: string): Promise<void> {
      try {
         await this.prismaService.user.delete({
            where: { id },
         });
      } catch (error) {
         if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
         ) {
            throw new NotFoundException(`User with id ${id} not found`);
         }
         throw error;
      }
   }
}
