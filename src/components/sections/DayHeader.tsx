import { H1, Text, useHostTheme } from "cursor/canvas";

interface Props {
  dateLabel: string;
  personName: string;
  company: string;
  startNote: string;
  timezoneLabel: string;
}

export function DayHeader({ dateLabel, personName, company, startNote, timezoneLabel }: Props) {
  const theme = useHostTheme();
  return (
    <div>
      <H1>{dateLabel}</H1>
      <Text style={{ color: theme.text.tertiary, marginTop: 4 }}>
        {personName} · {company} · {startNote} · {timezoneLabel}
      </Text>
    </div>
  );
}
