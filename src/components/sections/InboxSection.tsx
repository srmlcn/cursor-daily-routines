import { Callout, H2, Pill, Row, Stack, Text, useHostTheme } from "cursor/canvas";
import type { EmailThread } from "../../types";

interface Props {
  threads: EmailThread[];
}

export function InboxSection({ threads }: Props) {
  const theme = useHostTheme();
  if (threads.length === 0) return null;
  return (
    <Stack gap={10}>
      <Row gap={10} align="center">
        <H2>Inbox</H2>
        <Pill size="sm">{threads.length} thread{threads.length !== 1 ? "s" : ""}</Pill>
      </Row>
      <Stack gap={8}>
        {threads.map((t, i) => (
          <Callout key={i} tone="info" title={t.subject}>
            <Stack gap={4}>
              <Text style={{ fontSize: 13 }}><strong>Participants:</strong> {t.participants.join(" · ")}</Text>
              <Text style={{ fontSize: 13 }}>{t.summary}</Text>
              <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>{t.action}</Text>
            </Stack>
          </Callout>
        ))}
      </Stack>
    </Stack>
  );
}
