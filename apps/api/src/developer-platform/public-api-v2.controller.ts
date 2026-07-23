import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from './guards/api-key.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('v2') @UseGuards(ApiKeyGuard)
export class PublicApiV2Controller {
  constructor(private readonly prisma:PrismaService){}
  @Get('objectives') objectives(@Req() req:any,@Query('take') take?:string){return this.prisma.objective.findMany({where:{organizationId:req.apiPrincipal.organizationId},take:Math.min(100,Math.max(1,Number(take)||25)),orderBy:{updatedAt:'desc'}})}
  @Get('projects') projects(@Req() req:any,@Query('take') take?:string){return this.prisma.project.findMany({where:{organizationId:req.apiPrincipal.organizationId},take:Math.min(100,Math.max(1,Number(take)||25)),orderBy:{updatedAt:'desc'}})}
  @Get('analytics/metrics') metrics(@Req() req:any,@Query('take') take?:string){return this.prisma.metricDefinition.findMany({where:{organizationId:req.apiPrincipal.organizationId},take:Math.min(100,Math.max(1,Number(take)||25)),orderBy:{updatedAt:'desc'}})}
}
