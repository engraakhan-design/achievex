import { IsArray, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
export class InviteUserDto {
  @IsEmail() email: string;
  @IsString() @MaxLength(80) firstName: string;
  @IsString() @MaxLength(80) lastName: string;
  @IsOptional() @IsArray() @IsString({ each: true }) roleNames?: string[];
}
