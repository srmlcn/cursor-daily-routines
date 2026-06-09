import { Text, UsageBar, useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillStats } from "../../helpers";

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
}

export function CombinedUsageBar({ trackA, trackB }: Props) {
  const theme  = useHostTheme();
  const aStats = skillStats(trackA);
  const bStats = skillStats(trackB);
  const total  = trackA.length + trackB.length;
  const masteredAll = aStats.mastered + bStats.mastered;
  const overallPct  = Math.round((masteredAll / total) * 100);
  return (
    <UsageBar
      total={total}
      topLeftLabel={
        <Text style={{ fontSize: 12, fontWeight: 600, color: theme.text.secondary }}>
          Combined: {masteredAll} / {total} mastered
        </Text>
      }
      topRightLabel={
        <Text style={{ fontSize: 12, color: theme.text.tertiary }}>
          {overallPct}% overall
        </Text>
      }
      segments={[
        ...(aStats.mastered   > 0 ? [{ id: "a-m",  value: aStats.mastered,   color: "orange" as const }] : []),
        ...(aStats.inProgress > 0 ? [{ id: "a-ip", value: aStats.inProgress, color: "yellow" as const }] : []),
        ...(bStats.mastered   > 0 ? [{ id: "b-m",  value: bStats.mastered,   color: "green"  as const }] : []),
        ...(bStats.inProgress > 0 ? [{ id: "b-ip", value: bStats.inProgress, color: "yellow" as const }] : []),
      ]}
    />
  );
}
