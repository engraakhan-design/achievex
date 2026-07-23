export type Decision = 'APPROVE'|'REJECT'|'REQUEST_CHANGES';
export type Strategy = 'SINGLE'|'SEQUENTIAL'|'PARALLEL'|'MAJORITY'|'CONSENSUS'|'FIRST_RESPONSE';
export interface StageState { strategy: Strategy; minApprovals?: number|null; assignments: Array<{status:string}>; }
export function evaluateStage(stage:StageState): 'PENDING'|'APPROVED'|'REJECTED'|'CHANGES_REQUESTED' {
 const statuses=stage.assignments.map(a=>a.status); const total=statuses.length;
 const approved=statuses.filter(x=>x==='APPROVED').length, rejected=statuses.filter(x=>x==='REJECTED').length, changes=statuses.filter(x=>x==='CHANGES_REQUESTED').length;
 if(!total) return 'PENDING';
 if(stage.strategy==='FIRST_RESPONSE'){ if(rejected)return 'REJECTED'; if(changes)return 'CHANGES_REQUESTED'; if(approved)return 'APPROVED'; return 'PENDING'; }
 if(rejected) return 'REJECTED'; if(changes) return 'CHANGES_REQUESTED';
 const threshold=stage.strategy==='MAJORITY' ? (stage.minApprovals ?? Math.floor(total/2)+1) : stage.strategy==='CONSENSUS'||stage.strategy==='PARALLEL' ? total : 1;
 return approved>=threshold?'APPROVED':'PENDING';
}
