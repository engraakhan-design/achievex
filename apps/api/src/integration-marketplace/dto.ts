import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUrl } from 'class-validator';
export enum ListingTypeDto { CONNECTOR='CONNECTOR', AUTOMATION_TEMPLATE='AUTOMATION_TEMPLATE', WEBHOOK_APP='WEBHOOK_APP', API_APP='API_APP' }
export enum VisibilityDto { PRIVATE='PRIVATE', ORGANIZATION='ORGANIZATION', PUBLIC='PUBLIC' }
export class CreatePublisherDto { @IsString() name!:string; @IsOptional() @IsString() description?:string; @IsOptional() @IsUrl() websiteUrl?:string; }
export class CreateListingDto { @IsString() publisherId!:string; @IsString() name!:string; @IsString() slug!:string; @IsOptional() @IsString() description?:string; @IsEnum(ListingTypeDto) type!:ListingTypeDto; @IsEnum(VisibilityDto) visibility!:VisibilityDto; @IsOptional() @IsArray() categories?:string[]; @IsOptional() @IsArray() requiredScopes?:string[]; @IsOptional() @IsObject() manifest?:Record<string,unknown>; }
export class SubmitListingDto { @IsOptional() @IsString() notes?:string; }
export class ReviewListingDto { @IsString() decision!:string; @IsOptional() @IsString() notes?:string; @IsOptional() @IsArray() findings?:string[]; }
export class InstallListingDto { @IsOptional() @IsObject() configuration?:Record<string,unknown>; @IsOptional() @IsBoolean() autoUpdate?:boolean; }
export class ReviewDto { @IsString() title!:string; @IsString() body!:string; @IsString() rating!:string; }
export class IncidentDto { @IsString() title!:string; @IsString() severity!:string; @IsOptional() @IsString() description?:string; }
export class ResolveIncidentDto { @IsString() resolution!:string; }
