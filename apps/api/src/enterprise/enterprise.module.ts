import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { ScimController } from './scim.controller';
import { IdentityProvisioningController } from './identity-provisioning.controller';
import { IdentityProvisioningService } from './identity-provisioning.service';
@Module({ imports:[AuditModule], controllers:[EnterpriseController,ScimController,IdentityProvisioningController], providers:[EnterpriseService,IdentityProvisioningService], exports:[EnterpriseService] })
export class EnterpriseModule {}
