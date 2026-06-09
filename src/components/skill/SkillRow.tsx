import { Text, useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillStatus } from "../../helpers";
import { EvidenceDots } from "./EvidenceDots";

interface Props {
  skill: TrackedSkill;
  compact?: boolean;
}

export function SkillRow({ skill, compact = false }: Props) {
  const theme  = useHostTheme();
  const st     = skillStatus(skill);
  const latest = skill.ev[skill.ev.length - 1];
  const vPad   = compact ? "5px 0" : "6px 0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: vPad, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <EvidenceDots skill={skill} />
      <Text style={{
        flex: 1, fontSize: 13,
        color: st === "mastered" ? theme.text.tertiary : st === "in-progress" ? theme.text.primary : theme.text.secondary,
        textDecoration: st === "mastered" ? "line-through" : "none",
      }}>
        {skill.name}
      </Text>
      {st === "in-progress" && (
        <Text style={{ fontSize: 11, color: theme.category.yellow }}>{skill.ev.length}/3</Text>
      )}
      {latest && (
        <Text style={{ fontSize: 11, color: theme.text.quaternary, whiteSpace: "nowrap" }}>{latest.date}</Text>
      )}
    </div>
  );
}
