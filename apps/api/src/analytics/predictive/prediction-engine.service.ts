import { BadRequestException, Injectable } from '@nestjs/common';

type ModelType='LINEAR_TREND'|'MOVING_AVERAGE'|'EXPONENTIAL_SMOOTHING'|'RISK_SCORE';
export interface PredictionOutput { predictedValue:number; probability?:number; confidence:number; explanation:Record<string,unknown>; }
@Injectable()
export class PredictionEngineService {
  predict(type:ModelType,series:number[],features:Record<string,number>={},config:Record<string,unknown>={}):PredictionOutput{
    if(series.some(v=>!Number.isFinite(v))) throw new BadRequestException('Series must contain finite numbers');
    if(type!=='RISK_SCORE' && series.length<2) throw new BadRequestException('At least two observations are required');
    switch(type){
      case 'LINEAR_TREND': return this.linear(series);
      case 'MOVING_AVERAGE': return this.movingAverage(series,Number(config.window||3));
      case 'EXPONENTIAL_SMOOTHING': return this.smoothing(series,Number(config.alpha??0.35));
      case 'RISK_SCORE': return this.risk(features,config);
    }
  }
  private linear(y:number[]):PredictionOutput{const n=y.length,xm=(n-1)/2,ym=y.reduce((a,b)=>a+b,0)/n;let num=0,den=0;for(let i=0;i<n;i++){num+=(i-xm)*(y[i]-ym);den+=(i-xm)**2;}const slope=den?num/den:0,intercept=ym-slope*xm,pred=intercept+slope*n;const residual=y.reduce((a,v,i)=>a+(v-(intercept+slope*i))**2,0);const variance=y.reduce((a,v)=>a+(v-ym)**2,0);const r2=variance?Math.max(0,1-residual/variance):1;return {predictedValue:pred,confidence:this.clamp(r2),explanation:{method:'ordinary_least_squares',slope,intercept,samples:n,rSquared:r2}}}
  private movingAverage(y:number[],window:number):PredictionOutput{const w=Math.max(1,Math.min(y.length,Math.floor(window)));const slice=y.slice(-w),pred=slice.reduce((a,b)=>a+b,0)/w;const mean=y.reduce((a,b)=>a+b,0)/y.length;const cv=Math.abs(mean)>1e-9?Math.sqrt(y.reduce((a,v)=>a+(v-mean)**2,0)/y.length)/Math.abs(mean):1;return {predictedValue:pred,confidence:this.clamp(1-cv),explanation:{method:'moving_average',window:w,samples:y.length}}}
  private smoothing(y:number[],alpha:number):PredictionOutput{const a=Math.min(.99,Math.max(.01,alpha));let level=y[0];const errors:number[]=[];for(let i=1;i<y.length;i++){const forecast=level;errors.push(Math.abs(y[i]-forecast));level=a*y[i]+(1-a)*level;}const mae=errors.length?errors.reduce((x,z)=>x+z,0)/errors.length:0;const scale=Math.max(1,Math.abs(level));return {predictedValue:level,confidence:this.clamp(1-mae/scale),explanation:{method:'simple_exponential_smoothing',alpha:a,samples:y.length,meanAbsoluteError:mae}}}
  private risk(features:Record<string,number>,config:Record<string,unknown>):PredictionOutput{const weights=(config.weights||{}) as Record<string,number>;const intercept=Number(config.intercept||0);let score=intercept;const contributions:Record<string,number>={};for(const [k,w] of Object.entries(weights)){const c=Number(w)*Number(features[k]||0);score+=c;contributions[k]=c;}const probability=1/(1+Math.exp(-score));return {predictedValue:probability*100,probability,confidence:this.clamp(Number(config.confidence??.7)),explanation:{method:'weighted_logistic_risk_score',score,contributions}}}
  private clamp(v:number){return Math.max(0,Math.min(1,Number.isFinite(v)?v:0));}
}
