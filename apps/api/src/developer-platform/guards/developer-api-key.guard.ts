import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class DeveloperApiKeyGuard implements CanActivate {
 constructor(private readonly prisma:PrismaService){}
 async canActivate(context:ExecutionContext){const req=context.switchToHttp().getRequest();const raw=String(req.headers['x-achievex-api-key']||'').trim();if(!raw)throw new UnauthorizedException('X-AchieveX-API-Key is required');const hash=createHash('sha256').update(raw).digest('hex');const credential=await this.prisma.developerCredential.findFirst({where:{secretHash:hash,status:'ACTIVE',OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},include:{application:{include:{rateLimitPolicy:true}},accessGrants:{where:{status:'ACTIVE',OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]}}}});if(!credential||credential.application.status!=='ACTIVE')throw new UnauthorizedException('API credential is invalid, revoked, or expired');const required=String(context.getHandler()['requiredScope']||'');if(required&&!credential.scopes.includes(required))throw new ForbiddenException(`Missing API scope: ${required}`);req.apiPrincipal={organizationId:credential.organizationId,applicationId:credential.applicationId,credentialId:credential.id,scopes:credential.scopes,grants:credential.accessGrants};await this.prisma.developerCredential.update({where:{id:credential.id},data:{lastUsedAt:new Date()}});return true}
}
export const PublicApiScope=(scope:string)=>(target:any,key:string,descriptor:PropertyDescriptor)=>{descriptor.value.requiredScope=scope;return descriptor};
