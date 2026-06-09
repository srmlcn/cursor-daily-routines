import { useHostTheme } from "cursor/canvas";
import type { Block, CatKey } from "../../types";
import { toMins } from "../../helpers";
import { BlockChip } from "./BlockChip";

interface LaneDef {
  id: string;
  types: Block["type"][];
  catKey: CatKey;
}

interface Props {
  lane: LaneDef;
  blocks: Block[];
  displayIdx: number;
  isLast: boolean;
  height: number;
  dayStart: number;
  dayTotal: number;
  ticks: Array<{ absMins: number }>;
  color: string;
  onSelect: (idx: number) => void;
}

export function LaneRow({ lane, blocks, displayIdx, isLast, height, dayStart, dayTotal, ticks, color, onSelect }: Props) {
  const theme     = useHostTheme();
  const border    = theme.stroke.tertiary;
  const toPct     = (absMins: number) => `${((absMins - dayStart) / dayTotal) * 100}%`;
  return (
    <div style={{
      position: "relative", height,
      borderTop: `1px solid ${border}`,
      borderBottom: isLast ? `1px solid ${border}` : "none",
      overflow: "hidden",
    }}>
      {ticks.map(({ absMins }) => (
        <div key={absMins} style={{ position: "absolute", left: toPct(absMins), top: 0, bottom: 0, width: 1, background: border, pointerEvents: "none" }} />
      ))}
      {blocks.map((block, idx) => {
        if (!(lane.types as string[]).includes(block.type)) return null;
        const bStart  = toMins(block.start);
        const bEnd    = toMins(block.end);
        const leftPct = toPct(bStart);
        const widthPct = `${((bEnd - bStart) / dayTotal) * 100}%`;
        return (
          <BlockChip
            key={idx}
            block={block}
            blockIdx={idx}
            leftPct={leftPct}
            widthPct={widthPct}
            isSelected={idx === displayIdx}
            color={color}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}
