import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface AgentTool { name:string; description:string; risk:'READ'|'WRITE'|'SENSITIVE'; execute(org:string,userId:string,input:Record<string,unknown>):Promise<unknown>; }
@Injectable()
export class AgentToolRegistry {
 constructor(private readonly prisma:PrismaService){}
 private db(){return this.prisma as any;}
 list(){return [
  {name:'knowledge.search',description:'Search authorized enterprise knowledge',risk:'READ'},
  {name:'okr.list',description:'List organization objectives',risk:'READ'},
  {name:'risk.list',description:'List open enterprise risks',risk:'READ'},
  {name:'copilot.action.create',description:'Create an approval-gated suggested action',risk:'WRITE'}
 ];}
 async execute(name:string,org:string,userId:string,input:Record<string,unknown>){
  if(name==='okr.list') return this.db().objective.findMany({where:{organizationId:org},take:20,orderBy:{updatedAt:'desc'}});
  if(name==='risk.list') return this.db().riskRecord.findMany({where:{organizationId:org,status:{not:'CLOSED'}},take:20,orderBy:{updatedAt:'desc'}});
  if(name==='copilot.action.create') return {deferred:true,requestedByUserId:userId,payload:input};
  throw new Error(`Unsupported tool: ${name}`);
 }
}
