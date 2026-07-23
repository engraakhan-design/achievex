import { IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateConversationDto { @IsString() @MaxLength(160) title!: string; @IsIn(['DIRECT','GROUP','PROJECT','OKR','INITIATIVE','RISK','AUDIT','DOCUMENT','ANNOUNCEMENT']) type!: string; @IsOptional() @IsString() linkedEntityType?: string; @IsOptional() @IsString() linkedEntityId?: string; @IsArray() participantUserIds!: string[]; }
export class CreateMessageDto { @IsString() @MaxLength(12000) content!: string; @IsOptional() @IsString() parentMessageId?: string; }
export class CreateReactionDto { @IsString() messageId!: string; @IsIn(['LIKE','LOVE','CELEBRATE','ACKNOWLEDGE','QUESTION','WATCHING']) type!: string; }
