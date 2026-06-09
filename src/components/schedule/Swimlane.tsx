import { useHostTheme } from "cursor/canvas";
import type { Block, CatKey } from "../../types";
import { toMins, fmtMins, blockCatKey } from "../../helpers";
import { TimeAxis } from "./TimeAxis";
import { LaneLabel } from "./LaneLabel";
import { LaneRow } from "./LaneRow";

const LABEL_W = 88;
const ROW_H   = 54;
const AXIS_H  = 26;

interface LaneDef {
  id: string;
  label: string;
  catKey: CatKey;
  types: Block["type"][];
}

interface Props {
  blocks: Block[];
  laneDefs: LaneDef[];
  displayIdx: number;
  onSelect: (idx: number) => void;
  windowMins: number;
  dayStart: number;
  dayEnd: number;
  dayTotal: number;
}

export function Swimlane({ blocks, laneDefs, displayIdx, onSelect, windowMins, dayStart, dayEnd, dayTotal }: Props) {
  const theme      = useHostTheme();
  const isAll      = windowMins >= dayTotal;
  const zoomFactor = isAll ? 1 : dayTotal / windowMins;
  const toPct      = (absMins: number) => `${((absMins - dayStart) / dayTotal) * 100}%`;
  const border     = theme.stroke.tertiary;

  const tickInterval = windowMins <= 60 ? 15 : windowMins <= 180 ? 30 : 60;
  const ticks: Array<{ label: string; absMins: number; leftPct: string }> = [];
  for (let m = Math.ceil(dayStart / tickInterval) * tickInterval; m <= dayEnd; m += tickInterval) {
    ticks.push({ label: fmtMins(m), absMins: m, leftPct: toPct(m) });
  }

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <div style={{ width: LABEL_W, flexShrink: 0 }}>
        <div style={{ height: AXIS_H }} />
        {laneDefs.map((lane, i) => (
          <LaneLabel
            key={lane.id}
            label={lane.label}
            color={theme.category[lane.catKey]}
            height={ROW_H}
            borderTop={`1px solid ${border}`}
            borderBottom={i === laneDefs.length - 1 ? `1px solid ${border}` : undefined}
            paddingRight={10}
          />
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflowX: isAll ? "hidden" : "auto", overflowY: "hidden" }}>
        <div style={{ width: isAll ? "100%" : `${zoomFactor * 100}%` }}>
          <TimeAxis ticks={ticks} height={AXIS_H} />
          {laneDefs.map((lane, i) => (
            <LaneRow
              key={lane.id}
              lane={lane}
              blocks={blocks}
              displayIdx={displayIdx}
              isLast={i === laneDefs.length - 1}
              height={ROW_H}
              dayStart={dayStart}
              dayTotal={dayTotal}
              ticks={ticks}
              color={theme.category[lane.catKey]}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
