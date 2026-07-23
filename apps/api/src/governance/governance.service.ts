import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddEvidenceDto, CreateAssessmentDto, CreateControlDto, CreateFrameworkDto, CreatePolicyDto } from './dto/governance.dto';

@Injectable()
export class GovernanceService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(organizationId: string) {
    const [frameworks, policies, controls, evidence, assessments] = await Promise.all([
      this.prisma.governanceFramework.count({ where: { organizationId } }),
      this.prisma.governancePolicy.count({ where: { organizationId } }),
      this.prisma.governanceControl.count({ where: { organizationId } }),
      this.prisma.controlEvidence.count({ where: { organizationId } }),
      this.prisma.complianceAssessment.count({ where: { organizationId } }),
    ]);
    return { frameworks, policies, controls, evidence, assessments };
  }

  frameworks(organizationId: string) { return this.prisma.governanceFramework.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } }); }
  createFramework(organizationId: string, dto: CreateFrameworkDto) { return this.prisma.governanceFramework.create({ data: { organizationId, ...dto } }); }
  policies(organizationId: string) { return this.prisma.governancePolicy.findMany({ where: { organizationId }, orderBy: { updatedAt: 'desc' } }); }
  createPolicy(organizationId: string, dto: CreatePolicyDto) { return this.prisma.governancePolicy.create({ data: { organizationId, tags: dto.tags ?? [], ...dto } }); }
  controls(organizationId: string, frameworkId?: string) { return this.prisma.governanceControl.findMany({ where: { organizationId, ...(frameworkId ? { frameworkId } : {}) }, include: { evidence: true }, orderBy: { code: 'asc' } }); }
  createControl(organizationId: string, dto: CreateControlDto) { return this.prisma.governanceControl.create({ data: { organizationId, automated: false, ...dto } }); }
  async addEvidence(organizationId: string, dto: AddEvidenceDto) {
    const control = await this.prisma.governanceControl.findFirst({ where: { id: dto.controlId, organizationId } });
    if (!control) throw new NotFoundException('Control not found');
    return this.prisma.controlEvidence.create({ data: { organizationId, ...dto } });
  }
  assessments(organizationId: string) { return this.prisma.complianceAssessment.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } }); }
  createAssessment(organizationId: string, dto: CreateAssessmentDto) { return this.prisma.complianceAssessment.create({ data: { organizationId, ...dto } }); }
}
