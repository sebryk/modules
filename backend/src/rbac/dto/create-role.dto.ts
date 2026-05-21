import {
   ArrayUnique,
   IsArray,
   IsBoolean,
   IsOptional,
   IsString,
   IsUUID,
   MaxLength,
} from 'class-validator'

export class CreateRoleDto {
   @IsString()
   @MaxLength(255)
   public name!: string

   @IsOptional()
   @IsString()
   @MaxLength(255)
   public description?: string | null

   @IsArray()
   @ArrayUnique()
   @IsUUID('4', { each: true })
   public permissionIds!: string[]

   @IsOptional()
   @IsBoolean()
   public isSystem?: boolean
}
