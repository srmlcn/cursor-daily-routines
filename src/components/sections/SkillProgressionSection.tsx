import { Grid, H2, Row, Stack, Text, useHostTheme } from "cursor/canvas";
import type { TrackedSkill, UpdateEntry } from "../../types";
import { buildSkillIndex, skillStats } from "../../helpers";
import { CategoryDetail, FocusNext, OverviewCard, RecentUpdates } from "../skill";
import { CombinedUsageBar } from "./CombinedUsageBar";

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
  trackAName: string;
  trackBName: string;
  goalStart: string;
  goalEnd: string;
  goalDays: number;
  daysElapsed: number;
  recentUpdates: UpdateEntry[];
}

export function SkillProgressionSection({
  trackA, trackB, trackAName, trackBName,
  goalStart, goalEnd, goalDays, daysElapsed, recentUpdates,
}: Props) {
  const theme      = useHostTheme();
  const skillIndex = buildSkillIndex(trackA, trackB);
  const aStats     = skillStats(trackA);
  const bStats     = skillStats(trackB);
  return (
    <Stack gap={20}>
      <div>
        <H2>Skill Progression</H2>
        <Text style={{ color: theme.text.tertiary, fontSize: 12, marginTop: 2 }}>
          {goalStart} → {goalEnd} · 3 proofs to master · updated via daily debrief
        </Text>
      </div>

      <Grid columns={2} gap={16}>
        <OverviewCard lang={trackAName} skills={trackA} catKey="orange" daysElapsed={daysElapsed} goalDays={goalDays} goalEnd={goalEnd} />
        <OverviewCard lang={trackBName} skills={trackB} catKey="green"  daysElapsed={daysElapsed} goalDays={goalDays} goalEnd={goalEnd} />
      </Grid>

      <CombinedUsageBar trackA={trackA} trackB={trackB} />

      <FocusNext trackA={trackA} trackB={trackB} trackAName={trackAName} trackBName={trackBName} />

      <RecentUpdates updates={recentUpdates} skillIndex={skillIndex} trackAName={trackAName} trackBName={trackBName} maxRows={6} />

      <Grid columns={2} gap={12}>
        <Stack gap={8}>
          <Row gap={10} align="center">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
            <Text weight="semibold" style={{ color: theme.text.secondary }}>{trackAName}</Text>
            <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{aStats.mastered}/{trackA.length}</Text>
          </Row>
          <CategoryDetail skills={trackA} defaultOpen={false} compact={true} />
        </Stack>
        <Stack gap={8}>
          <Row gap={10} align="center">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
            <Text weight="semibold" style={{ color: theme.text.secondary }}>{trackBName}</Text>
            <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{bStats.mastered}/{trackB.length}</Text>
          </Row>
          <CategoryDetail skills={trackB} defaultOpen={false} compact={true} />
        </Stack>
      </Grid>

      <Text style={{ color: theme.text.quaternary, fontSize: 11, textAlign: "center" }}>
        ●●● mastered · ●●○ in progress · ○○○ not started · categories collapsed — click to expand
      </Text>
    </Stack>
  );
}
