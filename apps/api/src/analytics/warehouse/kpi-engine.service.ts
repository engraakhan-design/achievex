import { BadRequestException, Injectable } from '@nestjs/common';
import { AggregationType } from './dto/warehouse.dto';
@Injectable() export class KpiEngineService {
  calculate(aggregation:AggregationType|string, formula:any, context:Record<string,unknown>):number {
    const values=this.resolveValues(formula,context);
    switch(aggregation){
      case 'COUNT': return values.length;
      case 'SUM': return values.reduce((a,b)=>a+b,0);
      case 'AVERAGE': return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
      case 'MIN': return values.length?Math.min(...values):0;
      case 'MAX': return values.length?Math.max(...values):0;
      case 'PERCENTAGE': { const n=this.numberAt(context,formula.numerator); const d=this.numberAt(context,formula.denominator); return d?100*n/d:0; }
      case 'RATIO': { const n=this.numberAt(context,formula.numerator); const d=this.numberAt(context,formula.denominator); return d?n/d:0; }
      case 'WEIGHTED_SCORE': return (formula.items||[]).reduce((s:any,x:any)=>s+this.numberAt(context,x.field)*Number(x.weight||0),0);
      case 'FORMULA': return this.safeFormula(formula,context);
      default: throw new BadRequestException(`Unsupported aggregation: ${aggregation}`);
    }
  }
  private resolveValues(formula:any,ctx:Record<string,unknown>){ const raw=formula?.field?this.at(ctx,formula.field):formula?.values; const list=Array.isArray(raw)?raw:[raw]; return list.filter(v=>v!==undefined&&v!==null).map(Number).filter(Number.isFinite); }
  private at(ctx:any,path:string){ return String(path||'').split('.').filter(Boolean).reduce((v,k)=>v?.[k],ctx); }
  private numberAt(ctx:any,path:string){ const n=Number(this.at(ctx,path)); return Number.isFinite(n)?n:0; }
  private safeFormula(formula:any,ctx:any){
    const op=formula?.op; const args=(formula?.args||[]).map((a:any)=>typeof a==='number'?a:this.numberAt(ctx,a));
    if(!['add','subtract','multiply','divide'].includes(op)) throw new BadRequestException('Formula op must be allow-listed');
    if(op==='add') return args.reduce((a:number,b:number)=>a+b,0); if(op==='multiply') return args.reduce((a:number,b:number)=>a*b,1);
    if(op==='subtract') return (args[0]||0)-(args[1]||0); return args[1]?(args[0]||0)/args[1]:0;
  }
}
