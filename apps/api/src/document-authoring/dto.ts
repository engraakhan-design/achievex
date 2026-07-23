import { IsArray, IsIn, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateDocumentDto { @IsString() @MaxLength(180) title!:string; @IsOptional() @IsString() summary?:string; @IsOptional() @IsIn(['ORGANIZATION','RESTRICTED','PRIVATE']) visibility?:string; @IsOptional() @IsArray() allowedUserIds?:string[]; @IsOptional() @IsString() templateKey?:string; }
export class UpdateDocumentDto { @IsOptional() @IsString() @MaxLength(180) title?:string; @IsOptional() @IsString() summary?:string; @IsOptional() @IsIn(['ORGANIZATION','RESTRICTED','PRIVATE']) visibility?:string; @IsOptional() @IsArray() allowedUserIds?:string[]; }
export class CreateDocumentVersionDto { @IsString() content!:string; @IsOptional() @IsString() changeSummary?:string; @IsOptional() @IsObject() metadata?:Record<string,unknown>; }
export class RequestReviewDto { @IsArray() reviewerUserIds!:string[]; @IsOptional() @IsString() dueAt?:string; }
export class ReviewDecisionDto { @IsIn(['APPROVED','CHANGES_REQUESTED','REJECTED']) decision!:string; @IsOptional() @IsString() comments?:string; }
export class PublishDocumentDto { @IsOptional() @IsString() knowledgeSourceId?:string; }
