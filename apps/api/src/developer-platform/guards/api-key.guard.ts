import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const raw = String(request.headers['x-achievex-api-key'] || '').trim();
    if (!raw) throw new UnauthorizedException('API key is required');
    const hash = createHash('sha256').update(raw).digest('hex');
    const credential = await this.prisma.apiCredential.findFirst({where:{secretHash:hash,status:'ACTIVE',OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}]},include:{application:true}});
    if (!credential || credential.application.status !== 'ACTIVE') throw new UnauthorizedException('API key is invalid or expired');
    request.apiPrincipal={organizationId:credential.organizationId,applicationId:credential.applicationId,scopes:credential.scopes};
    await this.prisma.apiCredential.update({where:{id:credential.id},data:{lastUsedAt:new Date()}});
    return true;
  }
}
