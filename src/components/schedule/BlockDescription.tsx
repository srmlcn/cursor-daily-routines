import { useHostTheme } from "cursor/canvas";
import type { Block, BlockDetail } from "../../types";
import { blockCatKey } from "../../helpers";
import { BlockDescriptionHeader } from "./BlockDescriptionHeader";
import { BlockDescriptionBody } from "./BlockDescriptionBody";
import { BlockDescriptionNav } from "./BlockDescriptionNav";

interface Props {
  block: Block;
  detail: BlockDetail;
  idx: number;
  total: number;
  onNav: (delta: number) => void;
}

export function BlockDescription({ block, detail, idx, total, onNav }: Props) {
  const theme = useHostTheme();
  const color = theme.category[blockCatKey(block.type)];
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${theme.stroke.secondary}`, borderLeft: `3px solid ${color}`, overflow: "hidden" }}>
      <BlockDescriptionHeader block={block} detail={detail} color={color} />
      <BlockDescriptionBody detail={detail} color={color} />
      <BlockDescriptionNav idx={idx} total={total} onNav={onNav} />
    </div>
  );
}
