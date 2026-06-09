import type { TrackedSkill, Evidence } from "../types";

export function sk(id: string, name: string, cat: string, ev: Evidence[] = []): TrackedSkill {
  return { id, name, cat, ev };
}

export function skillStatus(skill: TrackedSkill): "mastered" | "in-progress" | "not-started" {
  if (skill.ev.length >= 3) return "mastered";
  if (skill.ev.length > 0)  return "in-progress";
  return "not-started";
}

export function skillStats(skills: TrackedSkill[]) {
  const mastered   = skills.filter(s => s.ev.length >= 3).length;
  const inProgress = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).length;
  return { mastered, inProgress, total: skills.length, pct: Math.round((mastered / skills.length) * 100) };
}

export function skillNextFocus(skills: TrackedSkill[]): TrackedSkill | null {
  const ip = skills
    .filter(s => s.ev.length > 0 && s.ev.length < 3)
    .sort((a, b) => b.ev.length - a.ev.length);
  if (ip.length > 0) return ip[0];
  return skills.find(s => s.ev.length === 0) ?? null;
}

export function skillGroupBy(skills: TrackedSkill[]): [string, TrackedSkill[]][] {
  const map = new Map<string, TrackedSkill[]>();
  for (const s of skills) {
    if (!map.has(s.cat)) map.set(s.cat, []);
    map.get(s.cat)!.push(s);
  }
  return Array.from(map.entries());
}

export function buildSkillIndex(...tracks: TrackedSkill[][]): Map<string, TrackedSkill> {
  return new Map(tracks.flat().map(s => [s.id, s]));
}
