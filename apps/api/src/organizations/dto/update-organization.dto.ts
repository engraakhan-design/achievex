import { IsIn, IsOptional, IsString, IsUrl, Length } from 'class-validator';
export class UpdateOrganizationDto {
  @IsOptional() @IsString() @Length(2, 120) name?: string;
  @IsOptional() @IsUrl() logoUrl?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() @Length(3, 3) currency?: string;
  @IsOptional() @IsIn(['ACTIVE','SUSPENDED','ARCHIVED']) status?: 'ACTIVE'|'SUSPENDED'|'ARCHIVED';
}
