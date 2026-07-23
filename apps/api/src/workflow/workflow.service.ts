import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDefinitionDto, SaveWorkflowVersionDto, StartWorkflowDto, CompleteWorkflowTaskDto } from './dto/workflow.dto';
import { nextStep, validateGraph, mergeVariables, DefinitionGraph } from './engine/workflow-engine';

@Injectable()
export class WorkflowService {
  constructor(private readonly prisma:PrismaService){}

  listDefinitions(organizationId:string){return this.prisma.workflowDefinition.findMany({where:{organizationId},include:{versions:{orderBy:{version:'desc'},take:1}},orderBy:{updatedAt:'desc'}})}

  createDefinition(organizationId:string,userId:string,dto:CreateWorkflowDefinitionDto){return this.prisma.workflowDefinition.create({data:{organizationId,key:dto.key,name:dto.name,description:dto.description,createdById:userId,updatedById:userId}})}

  async saveVersion(organizationId:string,userId:string,definitionId:string,dto:SaveWorkflowVersionDto){
    const definition=await this.prisma.workflowDefinition.findFirst({where:{id:definitionId,organizationId}});if(!definition)throw new NotFoundException('Workflow definition not found');
    const graph={steps:dto.steps.map((step:any)=>({...step,id:step.key})),transitions:dto.transitions.map((transition:any,index)=>({...transition,id:transition.id??`transition-${index}`,fromStepId:transition.fromStepKey,toStepId:transition.toStepKey}))} as unknown as DefinitionGraph;const errors=validateGraph(graph);if(errors.length)throw new BadRequestException(errors);
    const version=definition.currentVersion+1;
    return this.prisma.$transaction(async tx=>{
      const row=await tx.workflowVersion.create({data:{definitionId,version,name:dto.name,description:dto.description,steps:{create:dto.steps.map((s:any,i)=>({key:s.key,name:s.name,type:s.type,config:s.config??{},sortOrder:i}))}}});
      const steps=await tx.workflowStep.findMany({where:{versionId:row.id}});const byKey=new Map(steps.map(s=>[s.key,s.id]));
      await tx.workflowTransition.createMany({data:dto.transitions.map((t:any)=>({versionId:row.id,fromStepId:byKey.get(t.fromStepKey)!,toStepId:byKey.get(t.toStepKey)!,name:t.name,condition:t.condition??{},priority:t.priority??0}))});
      await tx.workflowDefinition.update({where:{id:definitionId},data:{currentVersion:version,updatedById:userId}});return row;
    });
  }

  async publish(organizationId:string,userId:string,definitionId:string){
    const definition=await this.prisma.workflowDefinition.findFirst({where:{id:definitionId,organizationId},include:{versions:{orderBy:{version:'desc'},take:1,include:{steps:true,transitions:true}}}});if(!definition||!definition.versions[0])throw new NotFoundException('Workflow version not found');
    const version=definition.versions[0];const errors=validateGraph({steps:version.steps as any,transitions:version.transitions as any});if(errors.length)throw new BadRequestException(errors);
    return this.prisma.$transaction([this.prisma.workflowVersion.update({where:{id:version.id},data:{isPublished:true,publishedAt:new Date(),publishedById:userId}}),this.prisma.workflowDefinition.update({where:{id:definition.id},data:{status:'PUBLISHED',updatedById:userId}})]);
  }

  async start(organizationId:string,userId:string,dto:StartWorkflowDto){
    const definition=await this.prisma.workflowDefinition.findFirst({where:{id:dto.definitionId,organizationId,status:'PUBLISHED'},include:{versions:{where:{isPublished:true},orderBy:{version:'desc'},take:1,include:{steps:true,transitions:true}}}});if(!definition||!definition.versions[0])throw new NotFoundException('Published workflow not found');
    const version=definition.versions[0],start=version.steps.find(s=>s.type==='START');if(!start)throw new BadRequestException('Published workflow has no START step');
    const graph={steps:version.steps as any,transitions:version.transitions as any};const first=nextStep(graph,start.id,dto.variables??{});if(!first)throw new BadRequestException('START step has no valid transition');
    return this.prisma.$transaction(async tx=>{const instance=await tx.workflowInstance.create({data:{organizationId,definitionId:definition.id,versionId:version.id,status:first.type==='END'?'COMPLETED':first.type==='USER_TASK'||first.type==='APPROVAL'?'WAITING':'RUNNING',businessKey:dto.businessKey,entityType:dto.entityType,entityId:dto.entityId,activeStepId:first.id,variables:(dto.variables??{}) as Prisma.InputJsonValue,startedById:userId,completedAt:first.type==='END'?new Date():undefined}});await tx.workflowHistory.create({data:{organizationId,instanceId:instance.id,type:'INSTANCE_STARTED',stepId:start.id,actorId:userId,message:'Workflow instance started'}});if(['USER_TASK','APPROVAL'].includes(first.type))await tx.workflowTask.create({data:{organizationId,instanceId:instance.id,stepId:first.id,title:first.name,payload:first.config as any}});return instance;});
  }

  async completeTask(organizationId:string,userId:string,taskId:string,dto:CompleteWorkflowTaskDto){
    const task=await this.prisma.workflowTask.findFirst({where:{id:taskId,organizationId,status:'OPEN'},include:{instance:{include:{version:{include:{steps:true,transitions:true}}}}}});if(!task)throw new NotFoundException('Open workflow task not found');
    const variables=mergeVariables(task.instance.variables as any,{...(dto.variables??{}),outcome:dto.outcome});const graph={steps:task.instance.version.steps as any,transitions:task.instance.version.transitions as any};const next=nextStep(graph,task.stepId,variables);if(!next)throw new BadRequestException('No valid workflow transition');
    return this.prisma.$transaction(async tx=>{await tx.workflowTask.update({where:{id:task.id},data:{status:'COMPLETED',outcome:dto.outcome,payload:(dto.payload??{}) as Prisma.InputJsonValue,completedAt:new Date(),completedById:userId}});const complete=next.type==='END';const waiting=['USER_TASK','APPROVAL'].includes(next.type);const instance=await tx.workflowInstance.update({where:{id:task.instanceId},data:{variables:variables as Prisma.InputJsonValue,activeStepId:next.id,status:complete?'COMPLETED':waiting?'WAITING':'RUNNING',completedAt:complete?new Date():undefined}});await tx.workflowHistory.createMany({data:[{organizationId,instanceId:instance.id,type:'TASK_COMPLETED',stepId:task.stepId,actorId:userId,message:`Task completed${dto.outcome?` with outcome ${dto.outcome}`:''}`,data:(dto.payload??{}) as Prisma.InputJsonValue},{organizationId,instanceId:instance.id,type:complete?'INSTANCE_COMPLETED':'TRANSITIONED',stepId:next.id,actorId:userId,message:complete?'Workflow completed':`Transitioned to ${next.name}`,data:{} as Prisma.InputJsonValue}]});if(waiting)await tx.workflowTask.create({data:{organizationId,instanceId:instance.id,stepId:next.id,title:next.name,payload:next.config as any}});return instance;});
  }

  listInstances(organizationId:string){return this.prisma.workflowInstance.findMany({where:{organizationId},include:{definition:true,activeStep:true,tasks:{where:{status:'OPEN'}}},orderBy:{startedAt:'desc'},take:100})}

  getInstance(organizationId:string,id:string){return this.prisma.workflowInstance.findFirst({where:{id,organizationId},include:{definition:true,version:true,activeStep:true,tasks:{orderBy:{createdAt:'desc'}},history:{orderBy:{createdAt:'asc'}}}})}
  history(organizationId:string,instanceId:string){return this.prisma.workflowHistory.findMany({where:{organizationId,instanceId},orderBy:{createdAt:'asc'}})}
}
