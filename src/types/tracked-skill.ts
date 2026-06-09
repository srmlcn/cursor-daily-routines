import type { Evidence } from "./evidence";

export interface TrackedSkill {
  id: string;
  name: string;
  cat: string;
  ev: Evidence[];
}
