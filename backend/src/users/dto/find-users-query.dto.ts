import { UserStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class FindUsersQueryDto {
   @IsOptional()
   @IsString()
   public search?: string

   @IsOptional()
   @IsString()
   public position?: string

   @IsOptional()
   @IsEnum(UserStatus)
   public status?: UserStatus

   @IsIn(['name', 'position', 'email', 'status', 'createdAt'])
   public sortBy: 'name' | 'position' | 'email' | 'status' | 'createdAt' = 'createdAt'

   @IsIn(['asc', 'desc'])
   public sortOrder: 'asc' | 'desc' = 'desc'

   @Type(() => Number)
   @IsInt()
   @Min(1)
   @Max(Number.MAX_SAFE_INTEGER)
   public page: number = 1

   @Type(() => Number)
   @IsInt()
   @Min(1)
   @Max(100)
   public pageSize: number = 10

   @IsOptional()
   @IsString()
   public include?: string
}
