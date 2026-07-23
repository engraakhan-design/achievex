import { IsIn, IsOptional, IsString } from 'class-validator';
export class PresenceHeartbeatDto { @IsString() deviceId!:string; @IsIn(['ONLINE','AWAY','BUSY','DO_NOT_DISTURB']) status!:string; @IsOptional() @IsString() activeWorkspace?:string; @IsOptional() @IsString() activeEntityType?:string; @IsOptional() @IsString() activeEntityId?:string; }
export class StartSessionDto { @IsString() title!:string; @IsOptional() @IsString() entityType?:string; @IsOptional() @IsString() entityId?:string; }
