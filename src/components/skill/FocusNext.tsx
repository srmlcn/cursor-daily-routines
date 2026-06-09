import { Grid, H2, Row, Stack, Text, useHostTheme } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillNextFocus } from "../../helpers";

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
  trackAName: string;
  trackBName: string;
}

export function FocusNext({ trackA, trackB, trackAName, trackBName }: Props) {
  const theme = useHostTheme();
  const aNext = skillNextFocus(trackA);
  const bNext = skillNextFocus(trackB);
  if (!aNext && !bNext) return null;
  return (
    <Stack gap={8}>
      <H2>Focus Next</H2>
      <Grid columns={2} gap={12}>
        {aNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.orange}44`, background: `${theme.category.orange}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.orange }}>{trackAName}</Text>
              {aNext.ev.length > 0 && <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{aNext.ev.length}/3 proofs</Text>}
            </Row>
            <Text style={{ fontSize: 14 }}>{aNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary }}>{aNext.cat}</Text>
          </div>
        )}
        {bNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.green}44`, background: `${theme.category.green}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.green }}>{trackBName}</Text>
              {bNext.ev.length > 0 && <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{bNext.ev.length}/3 proofs</Text>}
            </Row>
            <Text style={{ fontSize: 14 }}>{bNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary }}>{bNext.cat}</Text>
          </div>
        )}
      </Grid>
    </Stack>
  );
}
