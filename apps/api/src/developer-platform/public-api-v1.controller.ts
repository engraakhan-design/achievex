import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeveloperApiKeyGuard, PublicApiScope } from './guards/developer-api-key.guard';
@Controller('public/v1') @UseGuards(DeveloperApiKeyGuard)
export class PublicApiV1Controller {
 constructor(private readonly prisma:PrismaService){}
 private take(value?:string){return Math.min(100,Math.max(1,Number(value)||25))}
 @Get('organizations/current') @PublicApiScope('organization.read') organization(@Req() req:any){return this.prisma.organization.findUnique({where:{id:req.apiPrincipal.organizationId},select:{id:true,name:true,status:true,createdAt:true}})}
 @Get('okrs') @PublicApiScope('okr.read') okrs(@Req() req:any,@Query('take') take?:string){return this.prisma.objective.findMany({where:{organizationId:req.apiPrincipal.organizationId},take:this.take(take),orderBy:{updatedAt:'desc'}})}
 @Get('projects') @PublicApiScope('project.read') projects(@Req() req:any,@Query('take') take?:string){return this.prisma.project.findMany({where:{organizationId:req.apiPrincipal.organizationId},take:this.take(take),orderBy:{updatedAt:'desc'}})}
 @Get('documents') @PublicApiScope('document.read') documents(@Req() req:any,@Query('take') take?:string){return this.prisma.enterpriseDocument.findMany({where:{organizationId:req.apiPrincipal.organizationId,status:'PUBLISHED'},take:this.take(take),orderBy:{updatedAt:'desc'},select:{id:true,title:true,summary:true,visibility:true,publishedAt:true,updatedAt:true}})}
 @Get('workspaces') @PublicApiScope('workspace.read') workspaces(@Req() req:any,@Query('take') take?:string){return this.prisma.teamWorkspace.findMany({where:{organizationId:req.apiPrincipal.organizationId,status:'ACTIVE'},take:this.take(take),orderBy:{updatedAt:'desc'},select:{id:true,name:true,description:true,visibility:true,updatedAt:true}})}
}
