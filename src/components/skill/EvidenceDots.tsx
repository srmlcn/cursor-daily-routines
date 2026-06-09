import { useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";

interface Props {
  skill: TrackedSkill;
}

export function EvidenceDots({ skill }: Props) {
  const theme   = useHostTheme();
  const count   = Math.min(skill.ev.length, 3);
  const fill    = skill.ev.length >= 3 ? theme.category.green : theme.category.yellow;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          title={skill.ev[i]?.desc ?? "No evidence yet"}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i < count ? fill : theme.stroke.secondary,
          }}
        />
      ))}
    </div>
  );
}
