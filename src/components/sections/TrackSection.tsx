import { H2, Row, Stack, Text, useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillStats } from "../../helpers";
import { CategoryDetail } from "../skill/CategoryDetail";

interface Props {
  trackName: string;
  skills: TrackedSkill[];
  catKey: "orange" | "green";
  defaultOpen?: boolean;
  compact?: boolean;
}

export function TrackSection({ trackName, skills, catKey, defaultOpen = true, compact = false }: Props) {
  const theme  = useHostTheme();
  const { mastered, inProgress, total } = skillStats(skills);
  return (
    <Stack gap={12}>
      <Row gap={12} align="center">
        <H2>{trackName}</H2>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.category[catKey] }} />
        <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
          {mastered} mastered · {inProgress} in progress · {total} total
        </Text>
      </Row>
      <CategoryDetail skills={skills} defaultOpen={defaultOpen} compact={compact} />
    </Stack>
  );
}
