import { H2, Stack, Table, Text, useHostTheme } from "cursor/canvas";
import type { TrackedSkill, UpdateEntry } from "../../types";

interface Props {
  updates: UpdateEntry[];
  skillIndex: Map<string, TrackedSkill>;
  trackAName: string;
  trackBName: string;
  maxRows?: number;
}

export function RecentUpdates({ updates, skillIndex, trackAName, trackBName, maxRows = 8 }: Props) {
  const theme = useHostTheme();
  if (updates.length === 0) return null;
  const rows = updates.slice(0, maxRows).map(u => {
    const skillName = skillIndex.get(u.skillId)?.name ?? u.skillId;
    return [
      <Text size="small" style={{ color: theme.text.tertiary }}>{u.date}</Text>,
      <Text size="small" weight="medium" style={{ color: u.lang === "a" ? theme.category.orange : theme.category.green }}>
        {u.lang === "a" ? trackAName : trackBName}
      </Text>,
      <Text size="small">{skillName}</Text>,
      <Text size="small" style={{ color: theme.text.secondary }}>{u.desc}</Text>,
    ];
  });
  return (
    <Stack gap={8}>
      <H2>Recent Evidence</H2>
      <Table
        headers={["Date", "Track", "Skill", "Evidence"]}
        rows={rows}
        striped
        columnAlign={["left", "left", "left", "left"]}
      />
    </Stack>
  );
}
