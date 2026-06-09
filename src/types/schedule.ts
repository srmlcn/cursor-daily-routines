export type CatKey = "blue" | "green" | "orange" | "gray" | "purple";

export interface Block {
  start: string;
  end: string;
  label: string;
  sublabel: string;
  type: "ticket" | "skill-a" | "skill-b" | "break" | "lunch" | "meeting" | "ramp";
}

export interface BlockDetail {
  heading: string;
  description: string;
  bullets: string[];
  note?: string;
  tag: string;
}
