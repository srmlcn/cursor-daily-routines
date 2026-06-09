import { useHostTheme } from "cursor/canvas";
import type { Block, BlockDetail } from "../../types";
import { toMins } from "../../helpers";
import { BlockTagBadge } from "./BlockTagBadge";
import { BlockTimeMeta } from "./BlockTimeMeta";
import { BlockDurationPill } from "./BlockDurationPill";

interface Props {
  block: Block;
  detail: BlockDetail;
  color: string;
}

export function BlockDescriptionHeader({ block, detail, color }: Props) {
  const theme      = useHostTheme();
  const durationMins = toMins(block.end) - toMins(block.start);
  return (
    <div style={{ padding: "12px 16px 10px", background: theme.bg.chrome, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <BlockTagBadge tag={detail.tag} color={color} />
        <BlockTimeMeta start={block.start} end={block.end} />
        <BlockDurationPill durationMins={durationMins} excluded={block.type === "lunch"} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: theme.text.primary, lineHeight: 1.4 }}>
        {detail.heading}
      </div>
    </div>
  );
}
