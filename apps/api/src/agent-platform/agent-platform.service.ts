import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AIPlatformService } from '../ai-platform/ai-platform.service';
import { KnowledgePlatformService } from '../knowledge-platform/knowledge-platform.service';
import { AgentToolRegistry } from './agent-tools';
import { CreateAgentDto, RunAgentDto, UpdateAgentDto } from './dto';
@Injectable()
export class AgentPlatformService {
 constructor(private readonly prisma:PrismaService,private readonly ai:AIPlatformService,private readonly knowledge:KnowledgePlatformService,private readonly tools:AgentToolRegistry){}
 private db(){return this.prisma as any;}
 list(org:string){return this.db().aIAgent.findMany({where:{organizationId:org},include:{_count:{select:{runs:true}}},orderBy:{updatedAt:'desc'}})}
 create(org:string,userId:string,d:CreateAgentDto){return this.db().aIAgent.create({data:{organizationId:org,createdByUserId:userId,name:d.name,key:d.key,purpose:d.purpose,allowedTools:d.allowedTools??[],approvalRequired:d.approvalRequired??true,maxSteps:d.maxSteps??8}})}
 async update(org:string,id:string,d:UpdateAgentDto){const a=await this.db().aIAgent.findFirst({where:{id,organizationId:org}});if(!a)throw new NotFoundException('Agent not found');return this.db().aIAgent.update({where:{id},data:d})}
 toolsList(){return this.tools.list()}
 async getRun(org:string,id:string){const r=await this.db().aIAgentRun.findFirst({where:{id,organizationId:org},include:{steps:{orderBy:{stepNumber:'asc'}},approvals:true}});if(!r)throw new NotFoundException('Agent run not found');return r;}
 async run(org:string,userId:string,agentId:string,d:RunAgentDto){const agent=await this.db().aIAgent.findFirst({where:{id:agentId,organizationId:org,status:'ACTIVE'}});if(!agent)throw new NotFoundException('Active agent not found');const run=await this.db().aIAgentRun.create({data:{organizationId:org,agentId,userId,objective:d.objective,status:'RUNNING',context:d.context??{},correlationId:randomUUID(),startedAt:new Date()}});try{
  const grounded=await this.knowledge.context(org,userId,d.objective,6);
  const planResult=await this.ai.execute(org,userId,{modelId:d.modelId,module:`agent.${agent.key}`,messages:[{role:'system',content:`You are a governed enterprise agent. Purpose: ${agent.purpose}. Allowed tools: ${agent.allowedTools.join(', ')}. Produce a concise plan only; never claim actions executed.`},{role:'user',content:`Objective: ${d.objective}\nContext: ${grounded.context}`}],storeContent:false});
  await this.db().aIAgentStep.create({data:{organizationId:org,runId:run.id,stepNumber:1,type:'PLAN',status:'COMPLETED',input:{objective:d.objective},output:planResult.response}});
  let pending=false; let stepNo=2;
  for(const toolName of agent.allowedTools.slice(0,Math.max(0,agent.maxSteps-1))){const meta=this.tools.list().find(t=>t.name===toolName);if(!meta)continue;const requiresApproval=agent.approvalRequired||meta.risk!=='READ';const step=await this.db().aIAgentStep.create({data:{organizationId:org,runId:run.id,stepNumber:stepNo++,type:'TOOL',toolName,status:requiresApproval?'WAITING_APPROVAL':'RUNNING',input:{objective:d.objective}}});if(requiresApproval){pending=true;await this.db().aIAgentApproval.create({data:{organizationId:org,runId:run.id,stepId:step.id,requestedByUserId:userId,status:'PENDING'}});break;}const output=await this.tools.execute(toolName,org,userId,{objective:d.objective});await this.db().aIAgentStep.update({where:{id:step.id},data:{status:'COMPLETED',output}})}
  return this.db().aIAgentRun.update({where:{id:run.id},data:{status:pending?'WAITING_APPROVAL':'COMPLETED',completedAt:pending?undefined:new Date()},include:{steps:true,approvals:true}})
 }catch(e:any){await this.db().aIAgentRun.update({where:{id:run.id},data:{status:'FAILED',errorMessage:e?.message??'Agent run failed',completedAt:new Date()}});throw e}}
 async decide(org:string,userId:string,approvalId:string,approved:boolean,reason?:string){const approval=await this.db().aIAgentApproval.findFirst({where:{id:approvalId,organizationId:org},include:{step:true,run:true}});if(!approval)throw new NotFoundException('Approval not found');if(approval.status!=='PENDING')throw new BadRequestException('Approval already decided');if(approval.requestedByUserId===userId&&approved)throw new ForbiddenException('Independent approval is required');await this.db().aIAgentApproval.update({where:{id:approvalId},data:{status:approved?'APPROVED':'REJECTED',decidedByUserId:userId,reason,decidedAt:new Date()}});if(!approved){await this.db().aIAgentStep.update({where:{id:approval.stepId},data:{status:'REJECTED'}});return this.db().aIAgentRun.update({where:{id:approval.runId},data:{status:'CANCELLED',completedAt:new Date()}})}const output=await this.tools.execute(approval.step.toolName,org,approval.run.userId,approval.step.input as any);await this.db().aIAgentStep.update({where:{id:approval.stepId},data:{status:'COMPLETED',output}});return this.db().aIAgentRun.update({where:{id:approval.runId},data:{status:'COMPLETED',completedAt:new Date()}})}
}
