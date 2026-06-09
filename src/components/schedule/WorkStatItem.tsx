import { useHostTheme } from "cursor/canvas";

interface Props {
  label: string;
  mins: number;
  color?: string;
}

export function WorkStatItem({ label, mins, color }: Props) {
  const theme      = useHostTheme();
  const textColor  = color ?? theme.text.secondary;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: textColor, lineHeight: 1 }}>{mins}m</span>
      <span style={{ fontSize: 11, color: theme.text.tertiary }}>{label}</span>
    </div>
  );
}
