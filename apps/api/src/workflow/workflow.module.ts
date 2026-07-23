import { Module } from '@nestjs/common';
import { WorkflowController } from './workflow.controller';
import { ApprovalController } from './approval.controller';
import { WorkflowService } from './workflow.service';
import { ApprovalService } from './approval.service';
import { RuleController } from './rule.controller';
import { RuleService } from './rule.service';
import { SlaController } from './sla.controller';
import { SlaService } from './sla.service';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
@Module({controllers:[WorkflowController,ApprovalController,RuleController,SlaController,AutomationController],providers:[WorkflowService,ApprovalService,RuleService,SlaService,AutomationService],exports:[WorkflowService,ApprovalService,RuleService,SlaService,AutomationService]})
export class WorkflowModule {}
