import { buildCapacityPeriods, classifyUtilization, workingCapacity } from './capacity-planning';
describe('capacity planning',()=>{
 const cal={hoursPerDay:8,workingDays:[0,1,2,3,4],holidays:[] as string[]};
 it('removes holidays and availability exceptions',()=>{expect(workingCapacity(new Date('2026-07-19'),new Date('2026-07-23'),{...cal,holidays:['2026-07-20']},[{startsAt:new Date('2026-07-21'),endsAt:new Date('2026-07-21'),availableHours:4}])).toBe(28)});
 it('builds weekly demand versus capacity',()=>{const [p]=buildCapacityPeriods(new Date('2026-07-19'),new Date('2026-07-23'),'week',cal,[],[{startsAt:new Date('2026-07-01'),endsAt:new Date('2026-08-01'),allocationPercent:50}]);expect(p.capacityHours).toBe(40);expect(p.allocatedHours).toBe(20);expect(p.utilizationPercent).toBe(50)});
 it('classifies utilization bands',()=>{expect(classifyUtilization(110)).toBe('OVERALLOCATED');expect(classifyUtilization(50)).toBe('UNDERUTILIZED');expect(classifyUtilization(80)).toBe('BALANCED')});
});
