import { H2, Pill, Row, Stack, useHostTheme } from "cursor/canvas";
import type { Block, BlockDetail, CatKey } from "../../types";
import { BalanceStats, BlockDescription, Swimlane } from "../schedule";

interface LaneDef {
  id: string;
  label: string;
  catKey: CatKey;
  types: Block["type"][];
}

interface WindowOption {
  key: string;
  label: string;
  mins: number;
}

interface Props {
  blocks: Block[];
  blockDetails: BlockDetail[];
  laneDefs: LaneDef[];
  windowOptions: WindowOption[];
  displayIdx: number;
  winKey: string;
  dayStart: number;
  dayEnd: number;
  dayTotal: number;
  onSelect: (idx: number) => void;
  onNav: (delta: number) => void;
  onWinKey: (key: string) => void;
}

export function TimelineSection({
  blocks, blockDetails, laneDefs, windowOptions,
  displayIdx, winKey, dayStart, dayEnd, dayTotal,
  onSelect, onNav, onWinKey,
}: Props) {
  const theme      = useHostTheme();
  const windowMins = windowOptions.find(w => w.key === winKey)?.mins ?? dayTotal;
  return (
    <Stack gap={16}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <H2>Day Timeline</H2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BalanceStats blocks={blocks} />
          <div style={{ width: 1, height: 20, background: theme.stroke.secondary }} />
          <Row gap={6}>
            {windowOptions.map(opt => (
              <Pill key={opt.key} size="sm" active={winKey === opt.key} onClick={() => onWinKey(opt.key)}>
                {opt.label}
              </Pill>
            ))}
          </Row>
        </div>
      </div>

      <Swimlane
        blocks={blocks}
        laneDefs={laneDefs}
        displayIdx={displayIdx}
        onSelect={onSelect}
        windowMins={windowMins}
        dayStart={dayStart}
        dayEnd={dayEnd}
        dayTotal={dayTotal}
      />

      <BlockDescription
        block={blocks[displayIdx]}
        detail={blockDetails[displayIdx]}
        idx={displayIdx}
        total={blocks.length}
        onNav={onNav}
      />
    </Stack>
  );
}
