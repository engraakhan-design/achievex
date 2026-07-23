import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
export class LoginDto { @IsEmail() email: string; @IsString() @MinLength(1) @MaxLength(128) password: string; @IsString() @MinLength(3) @MaxLength(60) organizationSlug: string; }
