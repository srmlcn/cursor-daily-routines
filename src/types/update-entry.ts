export interface UpdateEntry {
  date: string;
  lang: "a" | "b";
  skillId: string;
  desc: string;
  type: "learning" | "gitlab";
}
