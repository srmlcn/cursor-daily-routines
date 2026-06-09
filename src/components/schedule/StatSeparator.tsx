import { useHostTheme } from "cursor/canvas";

export function StatSeparator() {
  const theme = useHostTheme();
  return <div style={{ width: 1, height: 14, background: theme.stroke.secondary }} />;
}
