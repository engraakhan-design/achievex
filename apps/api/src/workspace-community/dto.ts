import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateWorkspaceDto { @IsString() @MaxLength(160) name!:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsIn(['PRIVATE','INTERNAL','PUBLIC']) visibility?:string; @IsOptional() @IsArray() memberUserIds?:string[]; }
export class UpdateWorkspaceDto { @IsOptional() @IsString() @MaxLength(160) name?:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsIn(['PRIVATE','INTERNAL','PUBLIC']) visibility?:string; @IsOptional() @IsIn(['ACTIVE','ARCHIVED']) status?:string; }
export class AddWorkspaceMemberDto { @IsString() userId!:string; @IsOptional() @IsIn(['OWNER','ADMIN','MEMBER','VIEWER']) role?:string; }
export class CreateCommunityDto { @IsString() @MaxLength(160) name!:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsString() workspaceId?:string; @IsOptional() @IsIn(['OPEN','REQUEST_TO_JOIN','INVITE_ONLY']) membershipPolicy?:string; }
export class AddCommunityMemberDto { @IsString() userId!:string; @IsOptional() @IsIn(['OWNER','MODERATOR','MEMBER']) role?:string; }
export class CreateAnnouncementDto { @IsString() @MaxLength(180) title!:string; @IsString() content!:string; @IsOptional() @IsString() expiresAt?:string; }
export class LinkWorkspaceResourceDto { @IsString() resourceType!:string; @IsString() resourceId!:string; @IsOptional() @IsString() label?:string; }
