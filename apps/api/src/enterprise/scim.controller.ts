import { Body, Controller, Get, Headers, Param, Patch, Post, Query, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('scim/v2') @Public()
export class ScimController {
  constructor(private readonly prisma: PrismaService) {}
  private async organization(authorization?: string) {
    const raw = authorization?.replace(/^Bearer\s+/i, ''); if (!raw) throw new UnauthorizedException('SCIM bearer token required');
    const token = await this.prisma.scimToken.findUnique({ where: { tokenHash: createHash('sha256').update(raw).digest('hex') } });
    if (!token || token.revokedAt || (token.expiresAt && token.expiresAt <= new Date())) throw new UnauthorizedException('Invalid SCIM token');
    await this.prisma.scimToken.update({ where: { id: token.id }, data: { lastUsedAt: new Date() } }); return token.organizationId;
  }
  @Get('ServiceProviderConfig') config(){ return { schemas:['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'], patch:{supported:true}, bulk:{supported:false}, filter:{supported:true,maxResults:100}, changePassword:{supported:false}, sort:{supported:true}, etag:{supported:false}, authenticationSchemes:[{type:'oauthbearertoken',name:'Bearer Token',description:'AchieveX tenant SCIM token'}] }; }
  @Get('Users') async users(@Headers('authorization') auth:string,@Query('startIndex') start='1',@Query('count') count='100') { const organizationId=await this.organization(auth); const skip=Math.max(Number(start)-1,0),take=Math.min(Number(count),100); const [total,users]=await Promise.all([this.prisma.user.count({where:{organizationId}}),this.prisma.user.findMany({where:{organizationId},skip,take,orderBy:{createdAt:'asc'}})]); return { schemas:['urn:ietf:params:scim:api:messages:2.0:ListResponse'],totalResults:total,startIndex:skip+1,itemsPerPage:users.length,Resources:users.map(this.scimUser) }; }
  @Get('Users/:id') async user(@Headers('authorization') auth:string,@Param('id') id:string){ const organizationId=await this.organization(auth); const user=await this.prisma.user.findFirstOrThrow({where:{id,organizationId}}); return this.scimUser(user); }
  @Post('Users') async create(@Headers('authorization') auth:string,@Body() body:any){ const organizationId=await this.organization(auth); const email=String(body.userName).toLowerCase(); const user=await this.prisma.user.create({data:{organizationId,email,firstName:body.name?.givenName ?? '',lastName:body.name?.familyName ?? '',status:body.active===false?'SUSPENDED':'ACTIVE',emailVerifiedAt:new Date()}}); return this.scimUser(user); }
  @Patch('Users/:id') async patch(@Headers('authorization') auth:string,@Param('id') id:string,@Body() body:any){ const organizationId=await this.organization(auth); const existing=await this.prisma.user.findFirstOrThrow({where:{id,organizationId}}); const data:any={}; for(const operation of body.Operations ?? []){ const path=String(operation.path ?? '').toLowerCase(); if(path==='active') data.status=operation.value?'ACTIVE':'SUSPENDED'; if(path==='username') data.email=String(operation.value).toLowerCase(); if(path==='name.givenname') data.firstName=String(operation.value); if(path==='name.familyname') data.lastName=String(operation.value); } const user=await this.prisma.user.update({where:{id:existing.id},data}); return this.scimUser(user); }
  private scimUser(user:any){ return { schemas:['urn:ietf:params:scim:schemas:core:2.0:User'],id:user.id,userName:user.email,active:user.status==='ACTIVE',name:{givenName:user.firstName,familyName:user.lastName,formatted:`${user.firstName} ${user.lastName}`.trim()},emails:[{value:user.email,primary:true,type:'work'}],meta:{resourceType:'User',created:user.createdAt,lastModified:user.updatedAt,location:`/api/v1/scim/v2/Users/${user.id}`} }; }
}
