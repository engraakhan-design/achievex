import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma:PrismaService){}
  private async cycle(org:string,cycleId?:string){
    const cycle=cycleId?await this.prisma.okrCycle.findFirst({where:{id:cycleId,organizationId:org}}):await this.prisma.okrCycle.findFirst({where:{organizationId:org,OR:[{isDefault:true},{status:'ACTIVE'}]},orderBy:[{isDefault:'desc'},{startDate:'desc'}]});
    if(!cycle) throw new NotFoundException('No OKR cycle found'); return cycle;
  }
  private riskReason(o:any){
    const overdue=o.dueDate&&new Date(o.dueDate)<new Date()&&o.progress<100;
    const stale=o.keyResults.some((kr:any)=>!kr.checkIns.length||Date.now()-new Date(kr.checkIns[0].createdAt).getTime()>14*86400000);
    if(overdue) return 'Past due date'; if(o.status==='OFF_TRACK') return 'Marked off track'; if(stale) return 'No check-in for 14+ days'; return 'Low progress or confidence';
  }
  async executive(org:string,cycleId?:string){
    const cycle=await this.cycle(org,cycleId);
    const objectives=await this.prisma.objective.findMany({where:{organizationId:org,cycleId:cycle.id},include:{owner:{select:{id:true,firstName:true,lastName:true}},department:{select:{id:true,name:true}},team:{select:{id:true,name:true}},keyResults:{include:{checkIns:{orderBy:{createdAt:'desc'},take:1}}}}});
    const total=objectives.length,avg=total?objectives.reduce((s,o)=>s+o.progress,0)/total:0;
    const completed=objectives.filter(o=>o.status==='COMPLETED'||o.progress>=100).length;
    const risk=objectives.filter(o=>['AT_RISK','OFF_TRACK'].includes(o.status)||o.keyResults.some(kr=>kr.confidence==='LOW'));
    const checkIns=await this.prisma.checkIn.count({where:{organizationId:org,createdAt:{gte:new Date(Date.now()-7*86400000)},keyResult:{objective:{cycleId:cycle.id}}}});
    const totalKrs=objectives.reduce((s,o)=>s+o.keyResults.length,0);
    const checkedKrs=objectives.reduce((s,o)=>s+o.keyResults.filter(kr=>kr.checkIns.length&&Date.now()-new Date(kr.checkIns[0].createdAt).getTime()<7*86400000).length,0);
    return {cycle,scorecard:{objectives:total,averageProgress:Math.round(avg*10)/10,completionRate:total?Math.round(completed/total*1000)/10:0,atRisk:risk.length,checkInsLast7Days:checkIns,checkInCoverage:totalKrs?Math.round(checkedKrs/totalKrs*1000)/10:0},risks:risk.sort((a,b)=>a.progress-b.progress).slice(0,8).map(o=>({id:o.id,title:o.title,progress:o.progress,status:o.status,owner:`${o.owner.firstName} ${o.owner.lastName}`,area:o.team?.name||o.department?.name||o.scope,reason:this.riskReason(o)})),topObjectives:[...objectives].sort((a,b)=>b.progress-a.progress).slice(0,6).map(o=>({id:o.id,title:o.title,progress:o.progress,status:o.status,owner:`${o.owner.firstName} ${o.owner.lastName}`}))};
  }
  async alignment(org:string,cycleId?:string){
    const cycle=await this.cycle(org,cycleId); const items=await this.prisma.objective.findMany({where:{organizationId:org,cycleId:cycle.id},include:{owner:{select:{firstName:true,lastName:true}},department:{select:{name:true}},team:{select:{name:true}},_count:{select:{keyResults:true,children:true}}},orderBy:{createdAt:'asc'}});
    const map=new Map(items.map((o:any)=>[o.id,{id:o.id,title:o.title,scope:o.scope,status:o.status,progress:o.progress,parentId:o.parentId,owner:`${o.owner.firstName} ${o.owner.lastName}`,area:o.team?.name||o.department?.name||o.scope,keyResults:o._count.keyResults,children:[]}])) as Map<string,any>;
    const roots:any[]=[]; for(const item of map.values()){if(item.parentId&&map.has(item.parentId)) map.get(item.parentId).children.push(item); else roots.push(item)}
    return {cycle,roots,unlinked:roots.filter(x=>x.scope!=='COMPANY').length,total:items.length,aligned:items.filter(x=>x.parentId).length};
  }
  async progressTrend(org:string,q:AnalyticsQueryDto){
    const cycle=await this.cycle(org,q.cycleId); const from=q.from?new Date(q.from):cycle.startDate; const to=q.to?new Date(q.to):new Date(Math.min(Date.now(),cycle.endDate.getTime()));
    const checkIns=await this.prisma.checkIn.findMany({where:{organizationId:org,createdAt:{gte:from,lte:to},keyResult:{objective:{cycleId:cycle.id}}},select:{createdAt:true,progress:true,keyResultId:true},orderBy:{createdAt:'asc'}});
    const points=[] as any[]; const cursor=new Date(from); cursor.setUTCHours(0,0,0,0); const end=new Date(to); const latest=new Map<string,number>();
    while(cursor<=end){for(const c of checkIns.filter(x=>x.createdAt<=cursor)) latest.set(c.keyResultId,c.progress); points.push({date:cursor.toISOString().slice(0,10),progress:latest.size?Math.round([...latest.values()].reduce((a,b)=>a+b,0)/latest.size*10)/10:0}); cursor.setUTCDate(cursor.getUTCDate()+7)}
    return {cycle:{id:cycle.id,name:cycle.name},points};
  }
  async checkInHealth(org:string,cycleId?:string){
    const cycle=await this.cycle(org,cycleId); const krs=await this.prisma.keyResult.findMany({where:{organizationId:org,objective:{cycleId:cycle.id}},include:{owner:{select:{id:true,firstName:true,lastName:true}},checkIns:{orderBy:{createdAt:'desc'},take:1}}});
    const owners=new Map<string,any>(); for(const kr of krs){const x=owners.get(kr.ownerId)||{ownerId:kr.ownerId,owner:`${kr.owner.firstName} ${kr.owner.lastName}`,keyResults:0,current:0,stale:0,never:0};x.keyResults++;if(!kr.checkIns.length)x.never++;else if(Date.now()-kr.checkIns[0].createdAt.getTime()>14*86400000)x.stale++;else if(Date.now()-kr.checkIns[0].createdAt.getTime()<=7*86400000)x.current++;owners.set(kr.ownerId,x)}
    return {cycle:{id:cycle.id,name:cycle.name},owners:[...owners.values()].map(x=>({...x,coverage:x.keyResults?Math.round(x.current/x.keyResults*100):0})).sort((a,b)=>a.coverage-b.coverage)};
  }
  async breakdown(org:string,cycleId:string|undefined,groupBy:string){
    const cycle=await this.cycle(org,cycleId); const rows=await this.prisma.objective.findMany({where:{organizationId:org,cycleId:cycle.id},include:{department:true,team:true,owner:{select:{firstName:true,lastName:true}}}});
    const groups=new Map<string,any>(); for(const o of rows){const label=groupBy==='department'?o.department?.name||'Unassigned':groupBy==='team'?o.team?.name||'Unassigned':groupBy==='owner'?`${o.owner.firstName} ${o.owner.lastName}`:o.scope;const g=groups.get(label)||{label,objectives:0,totalProgress:0,atRisk:0,completed:0};g.objectives++;g.totalProgress+=o.progress;if(['AT_RISK','OFF_TRACK'].includes(o.status))g.atRisk++;if(o.status==='COMPLETED'||o.progress>=100)g.completed++;groups.set(label,g)}
    return {cycle:{id:cycle.id,name:cycle.name},groupBy,groups:[...groups.values()].map(g=>({...g,averageProgress:g.objectives?Math.round(g.totalProgress/g.objectives*10)/10:0,completionRate:g.objectives?Math.round(g.completed/g.objectives*100):0})).sort((a,b)=>b.averageProgress-a.averageProgress)};
  }
  async exportCsv(org:string,cycleId?:string){
    const cycle=await this.cycle(org,cycleId); const rows=await this.prisma.objective.findMany({where:{organizationId:org,cycleId:cycle.id},include:{owner:true,department:true,team:true,keyResults:{include:{owner:true}}},orderBy:{title:'asc'}});
    const esc=(v:any)=>`"${String(v??'').replace(/"/g,'""')}"`; const lines=[['Cycle','Objective','Scope','Area','Owner','Objective Status','Objective Progress','Key Result','KR Owner','KR Status','KR Progress','Confidence','Current','Target'].map(esc).join(',')];
    for(const o of rows){const krs=o.keyResults.length?o.keyResults:[null as any];for(const kr of krs)lines.push([cycle.name,o.title,o.scope,o.team?.name||o.department?.name||'',`${o.owner.firstName} ${o.owner.lastName}`,o.status,o.progress,kr?.title||'',kr?`${kr.owner.firstName} ${kr.owner.lastName}`:'',kr?.status||'',kr?.progress??'',kr?.confidence||'',kr?.currentValue??'',kr?.targetValue??''].map(esc).join(','))} return lines.join('\n');
  }
}
