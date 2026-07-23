export type StepType = 'START'|'USER_TASK'|'APPROVAL'|'DECISION'|'NOTIFICATION'|'AI_ACTION'|'WEBHOOK'|'END';
export type Step = { id:string; key:string; name:string; type:StepType; config?:Record<string,unknown> };
export type Transition = { id:string; fromStepId:string; toStepId:string; priority:number; condition?:Condition };
export type Condition = { field?:string; operator?:'eq'|'neq'|'gt'|'gte'|'lt'|'lte'|'in'|'exists'; value?:unknown };
export type DefinitionGraph = { steps:Step[]; transitions:Transition[] };

export function validateGraph(graph:DefinitionGraph): string[] {
  const errors:string[]=[];
  const starts=graph.steps.filter(s=>s.type==='START');
  const ends=graph.steps.filter(s=>s.type==='END');
  if(starts.length!==1) errors.push('Workflow must contain exactly one START step');
  if(ends.length<1) errors.push('Workflow must contain at least one END step');
  const ids=new Set(graph.steps.map(s=>s.id));
  for(const t of graph.transitions){
    if(!ids.has(t.fromStepId)) errors.push(`Transition ${t.id} has unknown source step`);
    if(!ids.has(t.toStepId)) errors.push(`Transition ${t.id} has unknown target step`);
    if(t.fromStepId===t.toStepId) errors.push(`Transition ${t.id} cannot target its source step`);
  }
  return errors;
}

export function evaluateCondition(condition:Condition|undefined, variables:Record<string,unknown>):boolean {
  if(!condition || !condition.field) return true;
  const actual=condition.field.split('.').reduce<unknown>((v,k)=>v&&typeof v==='object'?(v as Record<string,unknown>)[k]:undefined,variables);
  switch(condition.operator ?? 'eq'){
    case 'eq': return actual===condition.value;
    case 'neq': return actual!==condition.value;
    case 'gt': return Number(actual)>Number(condition.value);
    case 'gte': return Number(actual)>=Number(condition.value);
    case 'lt': return Number(actual)<Number(condition.value);
    case 'lte': return Number(actual)<=Number(condition.value);
    case 'in': return Array.isArray(condition.value)&&condition.value.includes(actual);
    case 'exists': return condition.value===false?actual==null:actual!=null;
  }
}

export function nextStep(graph:DefinitionGraph,currentStepId:string,variables:Record<string,unknown>):Step|null {
  const transitions=graph.transitions.filter(t=>t.fromStepId===currentStepId).sort((a,b)=>a.priority-b.priority);
  const transition=transitions.find(t=>evaluateCondition(t.condition,variables));
  if(!transition) return null;
  return graph.steps.find(s=>s.id===transition.toStepId) ?? null;
}

export function mergeVariables(current:Record<string,unknown>,updates?:Record<string,unknown>):Record<string,unknown>{
  return {...current,...(updates??{})};
}
