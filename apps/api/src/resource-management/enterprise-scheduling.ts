export type ScheduleAllocation = {
  id: string;
  resourceId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allocationPercent: number;
  hoursPerWeek?: number | null;
};

export type ScheduleMove = { allocationId: string; resourceId?: string; startsAt: string; endsAt: string };

export function daysBetweenInclusive(start: Date, end: Date): number {
  const ms = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) - Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  return Math.floor(ms / 86400000) + 1;
}

export function shiftAllocation(allocation: ScheduleAllocation, move: ScheduleMove): ScheduleAllocation {
  const startsAt = new Date(move.startsAt);
  const endsAt = new Date(move.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt < startsAt) throw new Error('Invalid scheduling range');
  return { ...allocation, resourceId: move.resourceId ?? allocation.resourceId, startsAt, endsAt };
}

export function detectScheduleOverlaps(allocations: ScheduleAllocation[]): Array<{ resourceId: string; allocationIds: string[]; startsAt: string; endsAt: string }> {
  const conflicts: Array<{ resourceId: string; allocationIds: string[]; startsAt: string; endsAt: string }> = [];
  const byResource = new Map<string, ScheduleAllocation[]>();
  for (const allocation of allocations) byResource.set(allocation.resourceId, [...(byResource.get(allocation.resourceId) ?? []), allocation]);
  for (const [resourceId, rows] of byResource) {
    const sorted = rows.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
    for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[j].startsAt > sorted[i].endsAt) break;
      conflicts.push({ resourceId, allocationIds: [sorted[i].id, sorted[j].id], startsAt: new Date(Math.max(sorted[i].startsAt.getTime(), sorted[j].startsAt.getTime())).toISOString(), endsAt: new Date(Math.min(sorted[i].endsAt.getTime(), sorted[j].endsAt.getTime())).toISOString() });
    }
  }
  return conflicts;
}

export function previewScenario(allocations: ScheduleAllocation[], moves: ScheduleMove[]) {
  const moveMap = new Map(moves.map(move => [move.allocationId, move]));
  const baselineConflicts = detectScheduleOverlaps(allocations);
  const proposed = allocations.map(allocation => moveMap.has(allocation.id) ? shiftAllocation(allocation, moveMap.get(allocation.id)!) : allocation);
  const proposedConflicts = detectScheduleOverlaps(proposed);
  return { allocations: proposed, baselineConflicts, proposedConflicts, conflictDelta: proposedConflicts.length - baselineConflicts.length };
}
