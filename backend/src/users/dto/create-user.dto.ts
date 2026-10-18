import { UserStatus } from '@prisma/client'
import {
   ArrayNotEmpty,
   ArrayUnique,
   IsArray,
   IsEmail,
   IsEnum,
   IsNotEmpty,
   IsOptional,
   IsString,
   IsUrl,
   IsUUID,
   MaxLength,
   MinLength,
   ValidateIf,
} from 'class-validator'

export class CreateUserDto {
   @IsNotEmpty()
   @IsEmail()
   @MaxLength(255)
   public email!: string

   @IsNotEmpty()
   @IsString()
   @MinLength(8)
   public password!: string

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public firstName!: string

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public lastName!: string

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public position!: string

   @ValidateIf((_object, value: unknown) => value !== undefined)
   @IsEnum(UserStatus)
   public status?: UserStatus

   @IsOptional()
   @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
   @MaxLength(2048)
   public avatarUrl?: string | null

   @IsArray()
   @ArrayNotEmpty()
   @ArrayUnique()
   @IsUUID('4', { each: true })
   public roleIds!: string[]
}
