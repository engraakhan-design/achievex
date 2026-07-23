import { detectSkillGaps, hiringSignal, rankStaffingCandidates, staffingMatchScore } from './resource-ai';
const candidates = [
  { id:'a', displayName:'A', capacityHours:40, allocatedHours:20, skills:[{skillId:'s1',proficiency:'EXPERT',verified:true}] },
  { id:'b', displayName:'B', capacityHours:40, allocatedHours:38, skills:[{skillId:'s1',proficiency:'INTERMEDIATE',verified:false}] },
];
describe('AI resource planning',()=>{
  it('prefers stronger skills and availability',()=>expect(rankStaffingCandidates(candidates,['s1'])[0].id).toBe('a'));
  it('returns a bounded score',()=>expect(staffingMatchScore(candidates[0],['s1'])).toBeLessThanOrEqual(100));
  it('detects unavailable advanced skills',()=>expect(detectSkillGaps(['s2'],candidates)[0].gap).toBe(true));
  it('raises hiring urgency for combined gaps',()=>expect(hiringSignal([{gap:true,availableResources:0},{gap:true,availableResources:0}],120,20).urgency).toBe('HIGH'));
});
