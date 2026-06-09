import type { Block } from "../types";

export function toMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function fmtMins(absMins: number): string {
  const h    = Math.floor(absMins / 60);
  const m    = absMins % 60;
  const ampm = h < 12 ? "am" : "pm";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}`;
}

export function fmtT(t: string): string {
  return fmtMins(toMins(t));
}

export function getCurrentBlockIdx(blocks: Block[], dayStart: number, dayEnd: number): number {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < blocks.length; i++) {
    if (nowMins >= toMins(blocks[i].start) && nowMins < toMins(blocks[i].end)) return i;
  }
  return nowMins < dayStart ? 0 : blocks.length - 1;
}
