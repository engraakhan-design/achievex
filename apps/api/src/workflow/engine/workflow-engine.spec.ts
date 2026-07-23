import { evaluateCondition, nextStep, validateGraph } from './workflow-engine';
const graph={steps:[{id:'s',key:'start',name:'Start',type:'START' as const},{id:'a',key:'approval',name:'Approval',type:'APPROVAL' as const},{id:'e',key:'end',name:'End',type:'END' as const}],transitions:[{id:'t1',fromStepId:'s',toStepId:'a',priority:0},{id:'t2',fromStepId:'a',toStepId:'e',priority:0,condition:{field:'outcome',operator:'eq' as const,value:'approved'}}]};
describe('workflow engine',()=>{
  it('validates a publishable graph',()=>expect(validateGraph(graph)).toEqual([]));
  it('evaluates deterministic conditions',()=>expect(evaluateCondition({field:'amount',operator:'gt',value:100},{amount:150})).toBe(true));
  it('selects a transition by priority and condition',()=>expect(nextStep(graph,'a',{outcome:'approved'})?.id).toBe('e'));
  it('stops when no transition matches',()=>expect(nextStep(graph,'a',{outcome:'rejected'})).toBeNull());
});
