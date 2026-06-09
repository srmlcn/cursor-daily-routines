import type { Block, CatKey } from "../types";

export function blockCatKey(type: Block["type"]): CatKey {
  if (type === "ticket")  return "blue";
  if (type === "skill-b") return "green";
  if (type === "skill-a") return "orange";
  if (type === "meeting") return "purple";
  return "gray";
}
