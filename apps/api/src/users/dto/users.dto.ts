import { IsArray, IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
export class UpdateUserDto {
 @IsOptional() @IsString() @Length(1,80) firstName?:string;
 @IsOptional() @IsString() @Length(1,80) lastName?:string;
 @IsOptional() @IsString() jobTitle?:string;
 @IsOptional() @IsString() phone?:string;
 @IsOptional() @IsEmail() email?:string;
 @IsOptional() @IsString() departmentId?:string|null;
 @IsOptional() @IsString() managerId?:string|null;
 @IsOptional() @IsIn(['INVITED','ACTIVE','SUSPENDED','DEACTIVATED']) status?:'INVITED'|'ACTIVE'|'SUSPENDED'|'DEACTIVATED';
 @IsOptional() @IsArray() @IsString({each:true}) roleNames?:string[];
}
export class ListUsersQuery { @IsOptional() @IsString() search?:string; @IsOptional() @IsString() departmentId?:string; @IsOptional() @IsIn(['INVITED','ACTIVE','SUSPENDED','DEACTIVATED']) status?:any; }
