import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator'

export class ReplaceUserRolesDto {
   @IsArray()
   @ArrayNotEmpty()
   @ArrayUnique()
   @IsUUID('4', { each: true })
   public roleIds!: string[]
}
