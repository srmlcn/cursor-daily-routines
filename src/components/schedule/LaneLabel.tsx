import { useHostTheme } from "cursor/canvas";
import { LaneDot } from "./LaneDot";

interface Props {
  label: string;
  color: string;
  height: number;
  borderTop: string;
  borderBottom?: string;
  paddingRight?: number;
}

export function LaneLabel({ label, color, height, borderTop, borderBottom, paddingRight = 10 }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{
      height, display: "flex", alignItems: "center",
      borderTop, borderBottom,
      paddingRight,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <LaneDot color={color} />
        <span style={{ fontSize: 12, color: theme.text.secondary, fontWeight: 500 }}>{label}</span>
      </div>
    </div>
  );
}
