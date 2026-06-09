import { useHostTheme } from "cursor/canvas";
import type { Block } from "../../types";
import { fmtT } from "../../helpers";

interface Props {
  block: Block;
  blockIdx: number;
  leftPct: string;
  widthPct: string;
  isSelected: boolean;
  color: string;
  onSelect: (idx: number) => void;
}

export function BlockChip({ block, blockIdx, leftPct, widthPct, isSelected, color, onSelect }: Props) {
  const theme    = useHostTheme();
  const durMins  = (parseInt(block.end.split(":")[0]) * 60 + parseInt(block.end.split(":")[1]))
                 - (parseInt(block.start.split(":")[0]) * 60 + parseInt(block.start.split(":")[1]));
  const isNarrow = durMins <= 15;
  const isLunch  = block.type === "lunch";
  return (
    <div
      onClick={() => onSelect(blockIdx)}
      title={`${fmtT(block.start)}–${fmtT(block.end)} · ${block.label}`}
      style={{
        position: "absolute", left: leftPct, width: widthPct,
        top: isSelected ? 5 : 8, bottom: isSelected ? 5 : 8,
        borderRadius: 4,
        background: isSelected ? color : isLunch ? `${color}18` : `${color}2A`,
        border: `${isSelected ? 2 : 1.5}px ${isLunch ? "dashed" : "solid"} ${isSelected ? color : `${color}55`}`,
        boxSizing: "border-box", overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: isNarrow ? "0 3px" : "0 7px", zIndex: isSelected ? 4 : 1,
        transition: "top 0.1s, bottom 0.1s, background 0.12s",
      }}
    >
      {!isNarrow && (
        <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 600, color: isSelected ? color : `${color}AA`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
          {block.label}
        </span>
      )}
      {!isNarrow && durMins >= 25 && (
        <span style={{ fontSize: 10, color: theme.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3, opacity: isSelected ? 0.9 : 0.5 }}>
          {block.sublabel}
        </span>
      )}
    </div>
  );
}
