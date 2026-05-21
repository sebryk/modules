import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateApplicationDto {
   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public title!: string

   @IsNotEmpty()
   @IsString()
   public description!: string
}
