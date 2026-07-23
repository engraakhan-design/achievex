import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApprovalRequestDto, CreateDelegationDto, CreateEscalationDto, DecideApprovalDto } from './dto/approval.dto';
import { evaluateStage } from './engine/approval-strategy';
@Injectable()
export class ApprovalService {
 constructor(private readonly prisma:PrismaService){}
 async create(organizationId:string,userId:string,dto:CreateApprovalRequestDto){
  if(!dto.stages.length) throw new BadRequestException('At least one approval stage is required');
  const orders=dto.stages.map(s=>s.stageOrder); if(new Set(orders).size!==orders.length) throw new BadRequestException('Stage order must be unique');
  return this.prisma.$transaction(async tx=>{
   const request=await tx.approvalRequest.create({data:{organizationId,title:dto.title,description:dto.description,workflowInstanceId:dto.workflowInstanceId,entityType:dto.entityType,entityId:dto.entityId,businessKey:dto.businessKey,strategy:dto.strategy,status:'PENDING',requestedById:userId,requestedAt:new Date(),dueAt:dto.dueAt?new Date(dto.dueAt):undefined,metadata:(dto.metadata??{}) as Prisma.InputJsonValue}});
   for(const input of [...dto.stages].sort((a,b)=>a.stageOrder-b.stageOrder)){
    const active=input.stageOrder===Math.min(...orders); const stage=await tx.approvalStage.create({data:{organizationId,requestId:request.id,name:input.name,stageOrder:input.stageOrder,strategy:input.strategy,status:active?'ACTIVE':'PENDING',minApprovals:input.minApprovals,dueAt:input.dueAt?new Date(input.dueAt):undefined,activatedAt:active?new Date():undefined}});
    for(const approverId of input.approverIds){ const delegate=await this.resolveDelegate(tx,organizationId,approverId); await tx.approvalAssignment.create({data:{organizationId,stageId:stage.id,approverId:delegate??approverId,originalApproverId:delegate?approverId:undefined,dueAt:stage.dueAt,delegatedAt:delegate?new Date():undefined}}); }
   }
   return tx.approvalRequest.findUnique({where:{id:request.id},include:{stages:{include:{assignments:true},orderBy:{stageOrder:'asc'}}}});
  });
 }
 private async resolveDelegate(tx:any,organizationId:string,delegatorId:string){const now=new Date();const d=await tx.approvalDelegation.findFirst({where:{organizationId,delegatorId,isActive:true,startsAt:{lte:now},OR:[{endsAt:null},{endsAt:{gte:now}}]},orderBy:{createdAt:'desc'}});return d?.delegateId as string|undefined;}
 list(organizationId:string,userId?:string){return this.prisma.approvalRequest.findMany({where:{organizationId,...(userId?{stages:{some:{assignments:{some:{approverId:userId,status:'PENDING'}}}}}: {})},include:{stages:{include:{assignments:true},orderBy:{stageOrder:'asc'}},decisions:{orderBy:{createdAt:'desc'}}},orderBy:{createdAt:'desc'},take:100});}
 get(organizationId:string,id:string){return this.prisma.approvalRequest.findFirst({where:{id,organizationId},include:{stages:{include:{assignments:true,decisions:true,escalations:true},orderBy:{stageOrder:'asc'}},decisions:{orderBy:{createdAt:'asc'}},escalations:{orderBy:{escalatedAt:'asc'}}}});}
 async decide(organizationId:string,userId:string,requestId:string,dto:DecideApprovalDto){
  const assignment=await this.prisma.approvalAssignment.findFirst({where:{organizationId,approverId:userId,status:'PENDING',stage:{requestId,status:'ACTIVE'}},include:{stage:{include:{assignments:true}},}}); if(!assignment) throw new NotFoundException('Pending approval assignment not found');
  return this.prisma.$transaction(async tx=>{
   await tx.approvalAssignment.update({where:{id:assignment.id},data:{status:dto.decision==='APPROVE'?'APPROVED':dto.decision==='REJECT'?'REJECTED':'CHANGES_REQUESTED',completedAt:new Date()}});
   await tx.approvalDecision.create({data:{organizationId,requestId,stageId:assignment.stageId,assignmentId:assignment.id,decision:dto.decision,decidedById:userId,comment:dto.comment,metadata:(dto.metadata??{}) as Prisma.InputJsonValue}});
   const refreshed=await tx.approvalStage.findUniqueOrThrow({where:{id:assignment.stageId},include:{assignments:true}}); const result=evaluateStage(refreshed as any);
   if(result!=='PENDING') await tx.approvalStage.update({where:{id:refreshed.id},data:{status:result,completedAt:new Date()}});
   if(result==='REJECTED'||result==='CHANGES_REQUESTED') await tx.approvalRequest.update({where:{id:requestId},data:{status:result,completedAt:new Date()}});
   if(result==='APPROVED'){
    const next=await tx.approvalStage.findFirst({where:{requestId,stageOrder:{gt:refreshed.stageOrder}},orderBy:{stageOrder:'asc'}});
    if(next){await tx.approvalStage.update({where:{id:next.id},data:{status:'ACTIVE',activatedAt:new Date()}});await tx.approvalRequest.update({where:{id:requestId},data:{currentStageOrder:next.stageOrder}});}else await tx.approvalRequest.update({where:{id:requestId},data:{status:'APPROVED',completedAt:new Date()}});
   }
   return tx.approvalRequest.findUnique({where:{id:requestId},include:{stages:{include:{assignments:true},orderBy:{stageOrder:'asc'}},decisions:true}});
  });
 }
 async createDelegation(organizationId:string,userId:string,dto:CreateDelegationDto){
  if(dto.delegatorId===dto.delegateId) throw new BadRequestException('Cannot delegate approvals to the same user'); const startsAt=new Date(dto.startsAt),endsAt=dto.endsAt?new Date(dto.endsAt):undefined;if(endsAt&&endsAt<=startsAt)throw new BadRequestException('Delegation end must be after start');
  const reverse=await this.prisma.approvalDelegation.findFirst({where:{organizationId,delegatorId:dto.delegateId,delegateId:dto.delegatorId,isActive:true}});if(reverse)throw new ConflictException('Delegation loop detected');
  return this.prisma.approvalDelegation.create({data:{organizationId,delegatorId:dto.delegatorId,delegateId:dto.delegateId,type:dto.type,startsAt,endsAt,reason:dto.reason,createdById:userId}});
 }
 listDelegations(organizationId:string){return this.prisma.approvalDelegation.findMany({where:{organizationId},orderBy:{createdAt:'desc'}});}
 async escalate(organizationId:string,requestId:string,dto:CreateEscalationDto){const stage=await this.prisma.approvalStage.findFirst({where:{id:dto.stageId,requestId,organizationId,status:'ACTIVE'}});if(!stage)throw new NotFoundException('Active approval stage not found');return this.prisma.approvalEscalation.create({data:{organizationId,requestId,stageId:stage.id,type:dto.type,targetUserId:dto.targetUserId,targetRole:dto.targetRole,reason:dto.reason}});}
 dashboard(organizationId:string){return this.prisma.$transaction(async tx=>{const [pending,approved,rejected,escalated]=await Promise.all([tx.approvalRequest.count({where:{organizationId,status:'PENDING'}}),tx.approvalRequest.count({where:{organizationId,status:'APPROVED'}}),tx.approvalRequest.count({where:{organizationId,status:'REJECTED'}}),tx.approvalEscalation.count({where:{organizationId,resolvedAt:null}})]);return{pending,approved,rejected,escalated};});}
}
