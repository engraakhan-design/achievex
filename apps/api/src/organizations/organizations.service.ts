import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}
  get(id: string) { return this.prisma.organization.findUniqueOrThrow({ where: { id }, select: { id:true,name:true,slug:true,logoUrl:true,timezone:true,currency:true,status:true,createdAt:true,_count:{select:{users:true,departments:true,teams:true}} } }); }
  async update(id:string, actorUserId:string, dto:UpdateOrganizationDto) {
    const organization=await this.prisma.organization.update({where:{id},data:dto});
    await this.audit.record({organizationId:id,actorUserId,action:'organization.updated',entityType:'Organization',entityId:id,metadata:{...dto} as Prisma.InputJsonValue});
    return organization;
  }
}
