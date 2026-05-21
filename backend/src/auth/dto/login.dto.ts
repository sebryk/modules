import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator'

export class LoginDto {
   @IsNotEmpty()
   @IsEmail()
   public email!: string

   @IsNotEmpty()
   @IsString()
   @MinLength(8)
   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
      message: 'password must contain uppercase, lowercase, number, and special character',
   })
   public password!: string
}
