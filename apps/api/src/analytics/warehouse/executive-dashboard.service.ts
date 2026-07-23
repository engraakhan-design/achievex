import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const ROLE_WIDGETS: Record<string, Array<{title:string;type:string;metricKey:string}>> = {
  CEO:[{title:'Strategic health',type:'SCORE',metricKey:'strategic_health'},{title:'OKR achievement',type:'TREND',metricKey:'okr_achievement'},{title:'Portfolio health',type:'DONUT',metricKey:'portfolio_health'},{title:'Execution risks',type:'TABLE',metricKey:'execution_risks'}],
  COO:[{title:'Delivery performance',type:'TREND',metricKey:'delivery_performance'},{title:'SLA compliance',type:'GAUGE',metricKey:'sla_compliance'},{title:'Automation effectiveness',type:'BAR',metricKey:'automation_effectiveness'},{title:'Operational bottlenecks',type:'TABLE',metricKey:'operational_bottlenecks'}],
  CFO:[{title:'Budget variance',type:'TREND',metricKey:'budget_variance'},{title:'Forecast exposure',type:'KPI',metricKey:'forecast_exposure'},{title:'Portfolio value',type:'BAR',metricKey:'portfolio_value'},{title:'Cost pressure',type:'TABLE',metricKey:'cost_pressure'}],
  CHRO:[{title:'Workforce utilization',type:'GAUGE',metricKey:'workforce_utilization'},{title:'Capacity risk',type:'TREND',metricKey:'capacity_risk'},{title:'Skills coverage',type:'HEATMAP',metricKey:'skills_coverage'},{title:'Hiring signals',type:'TABLE',metricKey:'hiring_signals'}],
  PMO:[{title:'Portfolio health',type:'DONUT',metricKey:'portfolio_health'},{title:'Milestone confidence',type:'TREND',metricKey:'milestone_confidence'},{title:'Resource conflicts',type:'BAR',metricKey:'resource_conflicts'},{title:'Top delivery risks',type:'TABLE',metricKey:'delivery_risks'}],
  DEPARTMENT_HEAD:[{title:'Department OKRs',type:'SCORE',metricKey:'department_okrs'},{title:'Team capacity',type:'GAUGE',metricKey:'team_capacity'},{title:'Initiative progress',type:'TREND',metricKey:'initiative_progress'},{title:'Pending decisions',type:'TABLE',metricKey:'pending_decisions'}],
};

@Injectable()
export class ExecutiveDashboardService {
  constructor(private prisma: PrismaService) {}

  async ensureTemplate(org:string,user:string,audience:string){
    if(!ROLE_WIDGETS[audience]) throw new BadRequestException('Unsupported executive audience');
    const key=`executive-${audience.toLowerCase().replace('_','-')}`;
    const existing=await this.prisma.dashboardDefinition.findFirst({where:{organizationId:org,key},include:{widgets:true}});
    if(existing) return existing;
    const metrics=await this.prisma.metricDefinition.findMany({where:{organizationId:org}});
    const byKey=new Map(metrics.map(m=>[m.key,m.id]));
    return this.prisma.dashboardDefinition.create({data:{organizationId:org,key,name:`${audience.replace('_',' ')} Executive Dashboard`,description:'Role-based executive scorecard',audience:audience as any,isTemplate:true,createdById:user,layout:{columns:12},widgets:{create:ROLE_WIDGETS[audience].map((w,i)=>({title:w.title,type:w.type,metricDefinitionId:byKey.get(w.metricKey)||null,config:{metricKey:w.metricKey,drilldown:true},position:i}))}},include:{widgets:true}});
  }

  async overview(org:string,audience?:string){
    const where:any={organizationId:org}; if(audience) where.audience=audience;
    return this.prisma.dashboardDefinition.findMany({where,include:{widgets:{orderBy:{position:'asc'}},savedViews:true},orderBy:[{isTemplate:'desc'},{name:'asc'}]});
  }

  async detail(org:string,id:string,filters:Record<string,string>={}){
    const dashboard=await this.prisma.dashboardDefinition.findFirst({where:{id,organizationId:org},include:{widgets:{orderBy:{position:'asc'}},savedViews:true}});
    if(!dashboard) throw new NotFoundException('Dashboard not found');
    const metricIds=dashboard.widgets.map(w=>w.metricDefinitionId).filter(Boolean) as string[];
    const snapshots=metricIds.length?await this.prisma.metricSnapshot.findMany({where:{organizationId:org,definitionId:{in:metricIds}},include:{definition:true},orderBy:{periodStart:'desc'},take:500}):[];
    const series=dashboard.widgets.map(widget=>{
      const rows=snapshots.filter(s=>s.definitionId===widget.metricDefinitionId).filter(s=>Object.entries(filters).every(([k,v])=>(s.dimensions as any)?.[k]===v));
      const latest=rows[0];
      const previous=rows[1];
      return {widgetId:widget.id,title:widget.title,type:widget.type,config:widget.config,value:latest?.value??null,periodStart:latest?.periodStart??null,change:latest&&previous?latest.value-previous.value:null,series:rows.slice(0,12).reverse().map(r=>({periodStart:r.periodStart,value:r.value,dimensions:r.dimensions}))};
    });
    return {dashboard,filters,widgets:series};
  }

  async saveView(org:string,user:string,dashboardId:string,name:string,filters:Record<string,string>,isDefault=false){
    const dashboard=await this.prisma.dashboardDefinition.findFirst({where:{id:dashboardId,organizationId:org}}); if(!dashboard)throw new NotFoundException('Dashboard not found');
    if(isDefault) await this.prisma.dashboardSavedView.updateMany({where:{organizationId:org,dashboardId,createdById:user,isDefault:true},data:{isDefault:false}});
    return this.prisma.dashboardSavedView.upsert({where:{dashboardId_name_createdById:{dashboardId,name,createdById:user}},update:{filters,isDefault},create:{organizationId:org,dashboardId,name,filters,isDefault,createdById:user}});
  }

  async drilldown(org:string,metricId:string,dimension?:string){
    const rows=await this.prisma.metricSnapshot.findMany({where:{organizationId:org,definitionId:metricId},orderBy:{periodStart:'desc'},take:500});
    if(!dimension)return rows;
    const grouped:Record<string,{count:number,total:number}>={};
    for(const r of rows){const key=String((r.dimensions as any)?.[dimension]??'Unspecified');grouped[key]??={count:0,total:0};grouped[key].count++;grouped[key].total+=r.value;}
    return Object.entries(grouped).map(([key,v])=>({dimension:key,count:v.count,value:Number((v.total/v.count).toFixed(2))})).sort((a,b)=>b.value-a.value);
  }
}
