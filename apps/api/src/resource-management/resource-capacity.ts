export type AllocationInput={allocationPercent:number;hoursPerWeek?:number|null};
export function calculateAllocatedHours(capacityHours:number, allocations:AllocationInput[]){return allocations.reduce((sum,a)=>sum+(a.hoursPerWeek??capacityHours*(a.allocationPercent/100)),0)}
export function calculateUtilization(capacityHours:number, allocations:AllocationInput[]){if(capacityHours<=0)return 0;return Math.round((calculateAllocatedHours(capacityHours,allocations)/capacityHours)*10000)/100}
export function isOverallocated(capacityHours:number, allocations:AllocationInput[]){return calculateAllocatedHours(capacityHours,allocations)>capacityHours}
