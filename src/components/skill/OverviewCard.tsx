import { Card, CardBody, CardHeader, Row, Stack, Text, UsageBar, useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillStats } from "../../helpers";

interface Props {
  lang: string;
  skills: TrackedSkill[];
  catKey: "orange" | "green";
  daysElapsed?: number;
  goalDays?: number;
  goalEnd?: string;
}

export function OverviewCard({ lang, skills, catKey, daysElapsed = 0, goalDays = 0, goalEnd = "" }: Props) {
  const theme                              = useHostTheme();
  const { mastered, inProgress, total, pct } = skillStats(skills);
  const color                              = theme.category[catKey];
  return (
    <Card>
      <CardHeader>{lang}</CardHeader>
      <CardBody>
        <Stack gap={10}>
          <Row gap={16} align="baseline">
            <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
            <Stack gap={2}>
              <Text style={{ fontSize: 13, color: theme.category.green }}>{mastered} mastered</Text>
              {inProgress > 0 && <Text style={{ fontSize: 12, color: theme.category.yellow }}>{inProgress} in progress</Text>}
              <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{total - mastered - inProgress} not started</Text>
            </Stack>
          </Row>
          <UsageBar
            total={total}
            topLeftLabel={`${mastered} / ${total} skills`}
            topRightLabel={daysElapsed > 0 ? `day ${daysElapsed} of ${goalDays}` : `goal: ${goalEnd}`}
            segments={[
              ...(mastered   > 0 ? [{ id: "m",  value: mastered,   color: "green"  as const }] : []),
              ...(inProgress > 0 ? [{ id: "ip", value: inProgress, color: "yellow" as const }] : []),
            ]}
          />
          {daysElapsed > 0 && mastered > 0 && (
            <Text style={{ fontSize: 11, color: theme.text.tertiary }}>
              {(mastered / daysElapsed).toFixed(1)} skills/day →
              ~{Math.ceil((total - mastered) / (mastered / daysElapsed))} days to complete
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
