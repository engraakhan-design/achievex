import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class RegisterDto {
  @IsString() @IsNotEmpty() @MaxLength(120) organizationName: string;
  @IsString() @Matches(/^[a-z0-9-]+$/) @MinLength(3) @MaxLength(60) organizationSlug: string;
  @IsString() @IsNotEmpty() @MaxLength(80) firstName: string;
  @IsString() @IsNotEmpty() @MaxLength(80) lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) @MaxLength(128) password: string;
}
