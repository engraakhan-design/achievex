import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class DecisionEngineService {
  validateConfidence(confidence:number,minimum:number){if(!Number.isFinite(confidence)||confidence<minimum)throw new BadRequestException(`Confidence must be at least ${minimum}`);return Math.min(1,Math.max(0,confidence));}
  simulate(baseline:Record<string,number>,changes:Record<string,number>,confidence=.65){const keys=new Set([...Object.keys(baseline),...Object.keys(changes)]);const projected:Record<string,number>={};const deltas:Record<string,number>={};for(const key of keys){const before=Number(baseline[key]??0);const delta=Number(changes[key]??0);if(!Number.isFinite(before)||!Number.isFinite(delta))throw new BadRequestException(`Scenario value ${key} must be numeric`);projected[key]=before+delta;deltas[key]=delta;}return {projectedOutcome:projected,confidence:Math.min(1,Math.max(0,confidence)),explanation:{method:'deterministic_delta_scenario',deltas,assumption:'All supplied changes are applied independently; no causal claim is made.'}};}
}
