import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator'

export class UpdateApplicationDto {
   @IsOptional()
   @ValidateIf((_object, value: unknown) => value !== undefined)
   @IsString()
   @MaxLength(255)
   public title?: string

   @IsOptional()
   @ValidateIf((_object, value: unknown) => value !== undefined)
   @IsString()
   public description?: string
}
