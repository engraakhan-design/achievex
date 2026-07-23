export type CandidateSkill = { skillId: string; skillName?: string; proficiency: string; yearsExperience?: number | null; verified?: boolean };
export type StaffingCandidate = { id: string; displayName: string; jobTitle?: string | null; capacityHours: number; allocatedHours: number; skills: CandidateSkill[]; teams?: unknown[] };

const proficiencyScore: Record<string, number> = { BEGINNER: 1, INTERMEDIATE: 2, ADVANCED: 3, EXPERT: 4 };

export function resourceUtilization(capacityHours: number, allocatedHours: number) {
  if (capacityHours <= 0) return allocatedHours > 0 ? 999 : 0;
  return Math.round((allocatedHours / capacityHours) * 10000) / 100;
}

export function staffingMatchScore(candidate: StaffingCandidate, requiredSkillIds: string[]) {
  const required = [...new Set(requiredSkillIds)];
  const matched = required.map(id => candidate.skills.find(s => s.skillId === id)).filter(Boolean) as CandidateSkill[];
  const coverage = required.length ? matched.length / required.length : 1;
  const proficiency = matched.length ? matched.reduce((sum, s) => sum + (proficiencyScore[s.proficiency] ?? 1), 0) / (matched.length * 4) : (required.length ? 0 : 1);
  const verification = matched.length ? matched.filter(s => s.verified).length / matched.length : 0;
  const availability = Math.max(0, Math.min(1, (candidate.capacityHours - candidate.allocatedHours) / Math.max(1, candidate.capacityHours)));
  return Math.round(Math.min(100, (coverage * 50 + proficiency * 25 + availability * 20 + verification * 5)));
}

export function rankStaffingCandidates(candidates: StaffingCandidate[], requiredSkillIds: string[]) {
  return candidates.map(candidate => ({ ...candidate, utilizationPercent: resourceUtilization(candidate.capacityHours, candidate.allocatedHours), matchScore: staffingMatchScore(candidate, requiredSkillIds) }))
    .sort((a, b) => b.matchScore - a.matchScore || a.utilizationPercent - b.utilizationPercent);
}

export function detectSkillGaps(requiredSkillIds: string[], candidates: StaffingCandidate[]) {
  return [...new Set(requiredSkillIds)].map(skillId => {
    const qualified = candidates.filter(c => c.skills.some(s => s.skillId === skillId && ['ADVANCED','EXPERT'].includes(s.proficiency)));
    const available = qualified.filter(c => resourceUtilization(c.capacityHours, c.allocatedHours) < 90);
    return { skillId, qualifiedResources: qualified.length, availableResources: available.length, gap: available.length === 0 };
  });
}

export function hiringSignal(gaps: Array<{ gap: boolean; availableResources: number }>, forecastDemandHours: number, availableHours: number) {
  const skillGapCount = gaps.filter(g => g.gap).length;
  const capacityGapHours = Math.max(0, forecastDemandHours - availableHours);
  const urgency = skillGapCount >= 2 || capacityGapHours >= 80 ? 'HIGH' : skillGapCount || capacityGapHours > 0 ? 'MEDIUM' : 'LOW';
  return { urgency, skillGapCount, capacityGapHours };
}
