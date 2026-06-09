import { useHostTheme } from "cursor/canvas";

interface Props {
  label: string;
  leftPct: string;
}

export function TimeAxisTick({ label, leftPct }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{
      position: "absolute", left: leftPct, top: 6,
      transform: "translateX(-50%)",
      fontSize: 11, color: theme.text.tertiary,
      whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
    }}>
      {label}
    </span>
  );
}
