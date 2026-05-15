import {
   BadRequestException,
   ConflictException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { PASSWORD_HASH_OPTIONS } from '../auth/auth.constants';
import { isPrismaErrorCode } from '../prisma/prisma-errors';
import { PrismaService } from '../prisma/prisma.service';
import { ReplaceUserRolesDto } from '../rbac/dto/replace-user-roles.dto';
import { baseRoleSelect } from '../rbac/rbac.select';
import type { Role } from '../rbac/rbac.types';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './users.types';
import { roleAssignmentsSelect, userWithRolesSelect } from './users.select';

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
         select: baseRoleSelect,
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
         if (isPrismaErrorCode(error, 'P2002')) {
            throw new ConflictException('User with this email already exists');
         }

         throw error;
      }
   }

   public async replaceUserRoles(
      userId: string,
      grantedBy: string,
      replaceUserRolesDto: ReplaceUserRolesDto,
   ): Promise<User> {
      const existingUser = await this.prismaService.user.findUnique({
         where: {
            id: userId,
         },
         select: {
            id: true,
         },
      });

      if (!existingUser) {
         throw new NotFoundException(`User with id ${userId} not found`);
      }

      const roles = await this.prismaService.role.findMany({
         where: {
            id: {
               in: replaceUserRolesDto.roleIds,
            },
         },
         select: baseRoleSelect,
      });

      if (roles.length !== replaceUserRolesDto.roleIds.length) {
         throw new BadRequestException('One or more roles do not exist');
      }

      const roleById = new Map<string, Role>(
         roles.map((role) => [role.id, role]),
      );
      const orderedRoles = replaceUserRolesDto.roleIds.map((roleId) => {
         const role = roleById.get(roleId);

         if (!role) {
            throw new BadRequestException('One or more roles do not exist');
         }

         return role;
      });

      await this.prismaService.$transaction(async (tx) => {
         await tx.roleAssignment.deleteMany({
            where: {
               userId,
            },
         });

         await tx.roleAssignment.createMany({
            data: orderedRoles.map((role) => ({
               userId,
               roleId: role.id,
               grantedBy,
            })),
         });
      });

      const user = await this.prismaService.user.findUnique({
         where: {
            id: userId,
         },
         select: {
            ...userWithRolesSelect,
            ...roleAssignmentsSelect,
         },
      });

      if (!user) {
         throw new NotFoundException(`User with id ${userId} not found`);
      }

      return user;
   }

   public async updateUser(
      userId: string,
      grantedBy: string,
      updateUserDto: UpdateUserDto,
   ): Promise<User> {
      const existingUser = await this.prismaService.user.findUnique({
         where: {
            id: userId,
         },
         select: {
            id: true,
         },
      });

      if (!existingUser) {
         throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (updateUserDto.roleIds.length === 0) {
         throw new BadRequestException('At least one role is required');
      }

      const roles = await this.prismaService.role.findMany({
         where: {
            id: {
               in: updateUserDto.roleIds,
            },
         },
         select: baseRoleSelect,
      });

      if (roles.length !== updateUserDto.roleIds.length) {
         throw new BadRequestException('One or more roles do not exist');
      }

      const roleById = new Map<string, Role>(
         roles.map((role) => [role.id, role]),
      );
      const orderedRoles = updateUserDto.roleIds.map((roleId) => {
         const role = roleById.get(roleId);

         if (!role) {
            throw new BadRequestException('One or more roles do not exist');
         }

         return role;
      });
      const passwordHash = await argon2.hash(
         updateUserDto.password,
         PASSWORD_HASH_OPTIONS,
      );

      try {
         await this.prismaService.$transaction(async (tx) => {
            await tx.user.update({
               where: {
                  id: userId,
               },
               data: {
                  email: updateUserDto.email,
                  firstName: updateUserDto.firstName,
                  lastName: updateUserDto.lastName,
                  position: updateUserDto.position,
                  passwordHash,
               },
               select: {
                  id: true,
               },
            });

            await tx.roleAssignment.deleteMany({
               where: {
                  userId,
               },
            });

            await tx.roleAssignment.createMany({
               data: orderedRoles.map((role) => ({
                  userId,
                  roleId: role.id,
                  grantedBy,
               })),
            });
         });
      } catch (error) {
         if (isPrismaErrorCode(error, 'P2002')) {
            throw new ConflictException('User with this email already exists');
         }

         if (isPrismaErrorCode(error, 'P2025')) {
            throw new NotFoundException(`User with id ${userId} not found`);
         }

         throw error;
      }

      const user = await this.prismaService.user.findUnique({
         where: {
            id: userId,
         },
         select: {
            ...userWithRolesSelect,
            ...roleAssignmentsSelect,
         },
      });

      if (!user) {
         throw new NotFoundException(`User with id ${userId} not found`);
      }

      return user;
   }

   public async deleteUser(id: string): Promise<void> {
      try {
         await this.prismaService.user.delete({
            where: { id },
         });
      } catch (error) {
         if (isPrismaErrorCode(error, 'P2025')) {
            throw new NotFoundException(`User with id ${id} not found`);
         }
         throw error;
      }
   }
}
