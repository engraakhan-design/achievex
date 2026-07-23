import { IsString, MaxLength, MinLength } from 'class-validator';
export class AcceptInvitationDto { @IsString() @MinLength(20) token: string; @IsString() @MinLength(10) @MaxLength(128) password: string; }
