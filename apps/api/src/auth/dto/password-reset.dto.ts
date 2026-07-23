import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
export class RequestPasswordResetDto { @IsEmail() email: string; @IsString() @MinLength(3) organizationSlug: string; }
export class ResetPasswordDto { @IsString() @MinLength(20) token: string; @IsString() @MinLength(10) @MaxLength(128) password: string; }
