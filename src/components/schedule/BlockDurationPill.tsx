import { useHostTheme } from "cursor/canvas";

interface Props {
  durationMins: number;
  excluded?: boolean;
}

export function BlockDurationPill({ durationMins, excluded = false }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{ fontSize: 11, color: theme.text.quaternary, background: theme.fill.tertiary, padding: "2px 6px", borderRadius: 4 }}>
      {durationMins} min{excluded ? " · not counted" : ""}
    </span>
  );
}
