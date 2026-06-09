import { Row, useHostTheme } from "cursor/canvas";
import type { Block } from "../../types";
import { toMins } from "../../helpers";
import { StatSeparator } from "./StatSeparator";
import { WorkStatItem } from "./WorkStatItem";

interface Props {
  blocks: Block[];
}

export function BalanceStats({ blocks }: Props) {
  const theme  = useHostTheme();
  const work   = blocks.filter(b => b.type !== "lunch");
  const ticket = work.filter(b => b.type === "ticket").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const skill  = work.filter(b => b.type === "skill-a" || b.type === "skill-b").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const brks   = work.filter(b => b.type === "break").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const total  = work.reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const totalH = Math.floor(total / 60);
  const totalM = total % 60;
  return (
    <Row gap={16} align="center">
      <span style={{ fontSize: 13, color: theme.text.tertiary, fontWeight: 500 }}>
        {totalH}h{totalM > 0 ? `${totalM}m` : ""} work
      </span>
      <StatSeparator />
      <WorkStatItem label="tickets"   mins={ticket} color={theme.category.blue} />
      <WorkStatItem label="skill dev" mins={skill} />
      <WorkStatItem label="breaks"    mins={brks}   color={theme.text.tertiary} />
    </Row>
  );
}
