import {
   ArrayNotEmpty,
   ArrayUnique,
   IsArray,
   IsEmail,
   IsNotEmpty,
   IsString,
   IsUUID,
   MaxLength,
   MinLength,
} from 'class-validator';

export class CreateUserDto {
   @IsNotEmpty()
   @IsEmail()
   @MaxLength(255)
   public email!: string;

   @IsNotEmpty()
   @IsString()
   @MinLength(8)
   public password!: string;

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public firstName!: string;

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public lastName!: string;

   @IsNotEmpty()
   @IsString()
   @MaxLength(255)
   public position!: string;

   @IsArray()
   @ArrayNotEmpty()
   @ArrayUnique()
   @IsUUID('4', { each: true })
   public roleIds!: string[];
}
