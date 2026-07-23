import { evaluateGroup, validateRuleGroup } from './rule-engine';
export const AUTOMATION_ACTION_TYPES=new Set(['CREATE_TASK','SEND_NOTIFICATION','START_WORKFLOW','ASSIGN_USER','UPDATE_FIELD','INVOKE_AI','CALL_WEBHOOK','EMIT_EVENT','START_SLA','CREATE_APPROVAL']);
export interface AutomationAction { type:string; config:Record<string,unknown> }
export function validateAutomation(conditions:unknown,actions:AutomationAction[]):void{if(conditions)validateRuleGroup(conditions);if(!Array.isArray(actions)||!actions.length)throw new Error('At least one action is required');for(const a of actions){if(!AUTOMATION_ACTION_TYPES.has(a.type))throw new Error(`Unsupported automation action: ${a.type}`);if(!a.config||typeof a.config!=='object')throw new Error(`Action ${a.type} requires config`);}}
export function shouldExecute(conditions:unknown,context:Record<string,unknown>):boolean{return conditions?evaluateGroup(conditions as any,context):true}
export function planActions(actions:AutomationAction[],dryRun=false){return actions.map((action,index)=>({index,action,status:dryRun?'WOULD_EXECUTE':'QUEUED'}))}
