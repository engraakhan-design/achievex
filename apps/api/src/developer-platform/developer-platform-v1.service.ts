import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessGrantDto, CreateDeveloperApplicationDto, CreateDeveloperCredentialDto, CreateRateLimitPolicyDto, RecordApiRequestDto, UpdateDeveloperApplicationDto } from './dto-v1';

const DEFAULT_SCOPES = [
  ['organization.read','Read current organization profile'],['user.read','Read tenant user directory'],
  ['okr.read','Read objectives and key results'],['okr.write','Create and update OKRs'],
  ['project.read','Read projects and initiatives'],['project.write','Create and update projects'],
  ['analytics.read','Read analytics metrics and reports'],['document.read','Read published enterprise documents'],
  ['document.write','Create and update enterprise documents'],['workspace.read','Read team workspaces'],
  ['workspace.write','Create and manage workspaces'],['collaboration.read','Read authorized conversations'],
  ['collaboration.write','Post messages and comments'],['ai.invoke','Invoke approved AI capabilities'],
] as const;

@Injectable()
export class DeveloperPlatformV1Service {
  constructor(private readonly prisma: PrismaService) {}

  async ensureScopeCatalog() {
    for (const [key, description] of DEFAULT_SCOPES) {
      await this.prisma.developerApiScope.upsert({where:{key},create:{key,description,active:true},update:{description,active:true}});
    }
    return this.prisma.developerApiScope.findMany({where:{active:true},orderBy:{key:'asc'}});
  }

  listApplications(org:string){return this.prisma.developerApplication.findMany({where:{organizationId:org},include:{credentials:{select:{id:true,name:true,prefix:true,status:true,scopes:true,lastUsedAt:true,expiresAt:true,createdAt:true}},accessGrants:true,rateLimitPolicy:true},orderBy:{createdAt:'desc'}})}
  async getApplication(org:string,id:string){const row=await this.prisma.developerApplication.findFirst({where:{id,organizationId:org},include:{credentials:true,accessGrants:true,rateLimitPolicy:true}});if(!row)throw new NotFoundException('Developer application not found');return row}
  async createApplication(org:string,userId:string,d:CreateDeveloperApplicationDto){if(!d.name?.trim())throw new BadRequestException('Application name is required');const allowed=new Set((await this.ensureScopeCatalog()).map((x:any)=>x.key));for(const scope of d.requestedScopes||[])if(!allowed.has(scope))throw new BadRequestException(`Unknown API scope: ${scope}`);return this.prisma.developerApplication.create({data:{organizationId:org,ownerUserId:d.ownerUserId||userId,name:d.name.trim(),description:d.description,environment:d.environment||'DEVELOPMENT',redirectUris:d.redirectUris||[],requestedScopes:d.requestedScopes||[],rateLimitPolicyId:d.rateLimitPolicyId,status:'ACTIVE'}})}
  async updateApplication(org:string,id:string,d:UpdateDeveloperApplicationDto){await this.getApplication(org,id);return this.prisma.developerApplication.update({where:{id},data:{name:d.name,description:d.description,status:d.status,redirectUris:d.redirectUris,requestedScopes:d.requestedScopes,rateLimitPolicyId:d.rateLimitPolicyId}})}

  async issueCredential(org:string,id:string,d:CreateDeveloperCredentialDto){const app=await this.getApplication(org,id);const requested=d.scopes?.length?d.scopes:app.requestedScopes;for(const scope of requested)if(!app.requestedScopes.includes(scope))throw new BadRequestException(`Credential scope not approved: ${scope}`);const secret=`ax_${app.environment.toLowerCase()}_${randomBytes(32).toString('base64url')}`;const row=await this.prisma.developerCredential.create({data:{organizationId:org,applicationId:id,name:d.name||`${app.name} credential`,prefix:secret.slice(0,18),secretHash:createHash('sha256').update(secret).digest('hex'),scopes:requested,status:'ACTIVE',expiresAt:d.expiresAt?new Date(d.expiresAt):undefined}});return {...row,secret,warning:'Copy this secret now. AchieveX stores only its hash and cannot display it again.'}}
  async rotateCredential(org:string,id:string){const old=await this.prisma.developerCredential.findFirst({where:{id,organizationId:org},include:{application:true}});if(!old)throw new NotFoundException('Credential not found');const replacement=await this.issueCredential(org,old.applicationId,{name:`${old.name} rotation`,scopes:old.scopes,expiresAt:old.expiresAt?.toISOString()});await this.prisma.developerCredential.update({where:{id},data:{status:'REVOKED',revokedAt:new Date(),replacedById:replacement.id}});return replacement}
  async revokeCredential(org:string,id:string){const found=await this.prisma.developerCredential.findFirst({where:{id,organizationId:org}});if(!found)throw new NotFoundException('Credential not found');return this.prisma.developerCredential.update({where:{id},data:{status:'REVOKED',revokedAt:new Date()}})}

  async grant(org:string,applicationId:string,d:CreateAccessGrantDto){const app=await this.getApplication(org,applicationId);if(!app.requestedScopes.includes(d.scope))throw new BadRequestException('Scope is not requested by this application');return this.prisma.developerAccessGrant.create({data:{organizationId:org,applicationId,scope:d.scope,resourceType:d.resourceType,resourceId:d.resourceId,expiresAt:d.expiresAt?new Date(d.expiresAt):undefined,status:'ACTIVE'}})}
  async revokeGrant(org:string,id:string){const found=await this.prisma.developerAccessGrant.findFirst({where:{id,organizationId:org}});if(!found)throw new NotFoundException('Access grant not found');return this.prisma.developerAccessGrant.update({where:{id},data:{status:'REVOKED',revokedAt:new Date()}})}

  policies(org:string){return this.prisma.developerRateLimitPolicy.findMany({where:{organizationId:org},orderBy:{createdAt:'desc'}})}
  createPolicy(org:string,d:CreateRateLimitPolicyDto){if(d.limit<1)throw new BadRequestException('Rate limit must be positive');return this.prisma.developerRateLimitPolicy.create({data:{organizationId:org,name:d.name,description:d.description,limit:d.limit,period:d.period,burstLimit:d.burstLimit||d.limit,environment:d.environment||'PRODUCTION',active:true}})}

  recordRequest(org:string,d:RecordApiRequestDto){return this.prisma.developerApiRequestLog.create({data:{organizationId:org,applicationId:d.applicationId,credentialId:d.credentialId,endpoint:d.endpoint,method:d.method,statusCode:d.statusCode,durationMs:d.durationMs,correlationId:d.correlationId,rateLimitDecision:d.rateLimitDecision||'ALLOWED',idempotencyKey:d.idempotencyKey}})}
  async usage(org:string,days=30){const since=new Date(Date.now()-Math.max(1,Math.min(days,90))*86400000);const [summary,byEndpoint,denied]=await Promise.all([this.prisma.developerApiRequestLog.aggregate({where:{organizationId:org,occurredAt:{gte:since}},_count:true,_avg:{durationMs:true}}),this.prisma.developerApiRequestLog.groupBy({by:['endpoint','method'],where:{organizationId:org,occurredAt:{gte:since}},_count:true,_avg:{durationMs:true},orderBy:{_count:{endpoint:'desc'}},take:25}),this.prisma.developerApiRequestLog.count({where:{organizationId:org,occurredAt:{gte:since},rateLimitDecision:'DENIED'}})]);return {days,requests:summary._count,averageLatencyMs:Math.round(summary._avg.durationMs||0),rateLimitDenials:denied,endpoints:byEndpoint}}
  logs(org:string,take=100){return this.prisma.developerApiRequestLog.findMany({where:{organizationId:org},orderBy:{occurredAt:'desc'},take:Math.min(250,Math.max(1,take)),select:{id:true,applicationId:true,endpoint:true,method:true,statusCode:true,durationMs:true,correlationId:true,rateLimitDecision:true,occurredAt:true}})}

  manifest(){return {openapi:'3.1.0',info:{title:'AchieveX Enterprise Public API',version:'1.0.0'},servers:[{url:'/api/public/v1'}],security:[{achieveXApiKey:[]}],components:{securitySchemes:{achieveXApiKey:{type:'apiKey',in:'header',name:'X-AchieveX-API-Key'}},headers:{'X-Correlation-ID':{schema:{type:'string'}},'Idempotency-Key':{schema:{type:'string'}}}},paths:{'/organizations/current':{get:{summary:'Get current organization',security:[{achieveXApiKey:['organization.read']}]}},'/okrs':{get:{summary:'List OKRs',security:[{achieveXApiKey:['okr.read']}]}},'/projects':{get:{summary:'List projects',security:[{achieveXApiKey:['project.read']}]}},'/documents':{get:{summary:'List published documents',security:[{achieveXApiKey:['document.read']}]}},'/workspaces':{get:{summary:'List authorized workspaces',security:[{achieveXApiKey:['workspace.read']}]}}}}}
}
