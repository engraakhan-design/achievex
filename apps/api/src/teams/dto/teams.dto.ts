import {IsArray,IsOptional,IsString,Length} from 'class-validator';
export class CreateTeamDto{@IsString() @Length(2,100) name:string;@IsOptional() @IsString() description?:string;@IsOptional() @IsString() departmentId?:string}
export class UpdateTeamDto{@IsOptional() @IsString() @Length(2,100) name?:string;@IsOptional() @IsString() description?:string;@IsOptional() @IsString() departmentId?:string}
export class UpdateTeamMembersDto{@IsArray() members:{userId:string;role?:'LEAD'|'MEMBER'}[]}
