import { Card, CardBody, CardHeader, H2, Pill, Row, Stack, Text, useHostTheme } from "cursor/canvas";
import type { Ticket } from "../../types";

interface Props {
  tickets: Ticket[];
}

export function GitLabSection({ tickets }: Props) {
  const theme = useHostTheme();
  if (tickets.length === 0) return null;
  return (
    <Stack gap={12}>
      <Row gap={10} align="center">
        <H2>GitLab</H2>
      </Row>
      <div style={{ display: "grid", gridTemplateColumns: tickets.length > 1 ? "1fr 1fr" : "1fr", gap: 16 }}>
        {tickets.map(t => (
          <Card key={t.id}>
            <CardHeader trailing={<Pill size="sm">{t.pipelineBadge ?? (t.mr ? "MR open" : "Local")}</Pill>}>
              {t.id} · {t.title}
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                {t.mr && (
                  <Row gap={8} align="center">
                    <Text size="small" style={{ color: theme.text.tertiary }}>MR</Text>
                    <Text size="small" weight="medium">{t.mr}</Text>
                    <Text size="small" style={{ color: theme.text.tertiary }}>{t.mrBadge}</Text>
                  </Row>
                )}
                <Text style={{ fontSize: 13, color: theme.text.secondary }}>{t.context}</Text>
                {t.failing.length > 0 && (
                  <Stack gap={3}>
                    <Text size="small" weight="medium">Failing jobs</Text>
                    {t.failing.map(j => (
                      <Text key={j} size="small" style={{ color: theme.text.tertiary, fontFamily: "monospace" }}>{j}</Text>
                    ))}
                  </Stack>
                )}
                <div style={{ borderLeft: `2px solid ${theme.stroke.secondary}`, paddingLeft: 8 }}>
                  <Text size="small" style={{ color: theme.text.secondary }}>{t.thread}</Text>
                </div>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </div>
    </Stack>
  );
}
