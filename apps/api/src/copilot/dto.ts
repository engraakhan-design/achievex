import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';
export class CreateConversationDto { @IsIn(['okr','project','governance','analytics','general']) domain!:string; @IsOptional() @IsString() title?:string; @IsOptional() @IsObject() context?:Record<string,unknown>; }
export class SendCopilotMessageDto { @IsString() content!:string; @IsOptional() @IsString() modelId?:string; }
export class CopilotFeedbackDto { @IsIn(['HELPFUL','NOT_HELPFUL']) rating!:'HELPFUL'|'NOT_HELPFUL'; @IsOptional() @IsString() comment?:string; }
export class CreateSuggestedActionDto { @IsString() type!:string; @IsString() title!:string; @IsOptional() @IsString() description?:string; @IsObject() payload!:Record<string,unknown>; }
