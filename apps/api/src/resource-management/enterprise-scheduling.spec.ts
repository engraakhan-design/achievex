import { detectScheduleOverlaps, previewScenario, shiftAllocation } from './enterprise-scheduling';
const base={id:'a',resourceId:'r1',title:'A',startsAt:new Date('2026-08-01'),endsAt:new Date('2026-08-10'),allocationPercent:50};
describe('enterprise scheduling',()=>{
 it('moves an allocation without mutating the source',()=>{const moved=shiftAllocation(base,{allocationId:'a',startsAt:'2026-08-05',endsAt:'2026-08-12'});expect(moved.startsAt.toISOString().slice(0,10)).toBe('2026-08-05');expect(base.startsAt.toISOString().slice(0,10)).toBe('2026-08-01')});
 it('detects overlapping allocations for the same resource',()=>{const conflicts=detectScheduleOverlaps([base,{...base,id:'b',startsAt:new Date('2026-08-08'),endsAt:new Date('2026-08-15')}]);expect(conflicts).toHaveLength(1)});
 it('previews conflict improvement without committing',()=>{const rows=[base,{...base,id:'b',startsAt:new Date('2026-08-08'),endsAt:new Date('2026-08-15')}];const result=previewScenario(rows,[{allocationId:'b',startsAt:'2026-08-11',endsAt:'2026-08-18'}]);expect(result.conflictDelta).toBe(-1);expect(rows[1].startsAt.toISOString().slice(0,10)).toBe('2026-08-08')});
});
