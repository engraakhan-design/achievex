import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum GroupBy { SCOPE='scope', DEPARTMENT='department', TEAM='team', OWNER='owner' }
export class AnalyticsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() cycleId?: string;
  @ApiPropertyOptional({ enum: GroupBy }) @IsOptional() @IsEnum(GroupBy) groupBy?: GroupBy;
  @ApiPropertyOptional() @IsOptional() @IsDateString() from?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() to?: string;
}
