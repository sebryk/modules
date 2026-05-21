import {
   BadRequestException,
   ConflictException,
   ForbiddenException,
   Injectable,
   NotFoundException,
} from '@nestjs/common'

import { isPrismaErrorCode } from '../prisma/prisma-errors'
import { PrismaService } from '../prisma/prisma.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { PermissionsService } from './permissions.service'
import { baseRoleSelect, permissionSelect, rolePermissionsSelect } from './rbac.select'
import type { Permission, Role } from './rbac.types'

@Injectable()
export class RbacService {
   public constructor(
      private readonly prismaService: PrismaService,
      private readonly permissionsService: PermissionsService,
   ) {}

   public async findRoles({ withPermissions = false } = {}): Promise<Role[]> {
      const roles = await this.prismaService.role.findMany({
         select: {
            ...baseRoleSelect,
            ...(withPermissions && rolePermissionsSelect),
         },
         orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
      })

      if (!withPermissions) {
         return roles
      }

      return roles.map((role) => this.mapRoleWithPermissions(role as never))
   }

   public async createRole(actorId: string, createRoleDto: CreateRoleDto): Promise<Role> {
      if (createRoleDto.isSystem) {
         await this.ensureManageSystemPermission(actorId)
      }

      const permissions = await this.loadPermissions(createRoleDto.permissionIds)

      try {
         const role = await this.prismaService.$transaction(async (tx) => {
            const createdRole = await tx.role.create({
               data: {
                  name: createRoleDto.name,
                  description: createRoleDto.description ?? null,
                  isSystem: createRoleDto.isSystem ?? false,
               },
               select: baseRoleSelect,
            })

            if (createRoleDto.permissionIds.length > 0) {
               await tx.rolePermission.createMany({
                  data: createRoleDto.permissionIds.map((permissionId) => ({
                     roleId: createdRole.id,
                     permissionId,
                  })),
               })
            }

            return createdRole
         })

         return {
            ...role,
            permissions: this.orderPermissions(permissions, createRoleDto.permissionIds),
         }
      } catch (error) {
         if (isPrismaErrorCode(error, 'P2002')) {
            throw new ConflictException('Role with this name already exists')
         }

         throw error
      }
   }

   public async updateRole(
      actorId: string,
      roleId: string,
      updateRoleDto: UpdateRoleDto,
   ): Promise<Role> {
      const existingRole = await this.prismaService.role.findUnique({
         where: {
            id: roleId,
         },
         select: baseRoleSelect,
      })

      if (!existingRole) {
         throw new NotFoundException(`Role with id ${roleId} not found`)
      }

      if (existingRole.isSystem) {
         await this.ensureManageSystemPermission(actorId)
      }

      const permissions = await this.loadPermissions(updateRoleDto.permissionIds)

      try {
         const role = await this.prismaService.$transaction(async (tx) => {
            await tx.rolePermission.deleteMany({
               where: {
                  roleId,
               },
            })

            if (updateRoleDto.permissionIds.length > 0) {
               await tx.rolePermission.createMany({
                  data: updateRoleDto.permissionIds.map((permissionId) => ({
                     roleId,
                     permissionId,
                  })),
               })
            }

            return tx.role.update({
               where: {
                  id: roleId,
               },
               data: {
                  name: updateRoleDto.name,
                  description: updateRoleDto.description ?? null,
               },
               select: baseRoleSelect,
            })
         })

         return {
            ...role,
            permissions: this.orderPermissions(permissions, updateRoleDto.permissionIds),
         }
      } catch (error) {
         if (isPrismaErrorCode(error, 'P2002')) {
            throw new ConflictException('Role with this name already exists')
         }

         throw error
      }
   }

   private async loadPermissions(permissionIds: string[]): Promise<Permission[]> {
      if (permissionIds.length === 0) {
         return []
      }

      const permissions = await this.prismaService.permission.findMany({
         where: {
            id: {
               in: permissionIds,
            },
         },
         select: permissionSelect,
      })

      if (permissions.length !== permissionIds.length) {
         throw new BadRequestException('One or more permissions do not exist')
      }

      return permissions
   }

   private async ensureManageSystemPermission(actorId: string): Promise<void> {
      const permissions = await this.permissionsService.getUserPermissions(actorId)

      if (!permissions.has('role:manage_system')) {
         throw new ForbiddenException('Permission denied')
      }
   }

   private mapRoleWithPermissions(role: {
      id: string
      name: string
      description: string | null
      isSystem: boolean
      rolePermissions: Array<{
         permission: Permission
      }>
   }): Role {
      return {
         id: role.id,
         name: role.name,
         description: role.description,
         isSystem: role.isSystem,
         permissions: role.rolePermissions.map(({ permission }) => permission),
      }
   }

   private orderPermissions(permissions: Permission[], permissionIds: string[]): Permission[] {
      const permissionById = new Map(permissions.map((permission) => [permission.id, permission]))

      return permissionIds.map((permissionId) => {
         const permission = permissionById.get(permissionId)

         if (!permission) {
            throw new BadRequestException('One or more permissions do not exist')
         }

         return permission
      })
   }
}
