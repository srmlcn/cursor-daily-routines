import { Button, useHostTheme } from "cursor/canvas";

interface Props {
  idx: number;
  total: number;
  onNav: (delta: number) => void;
}

export function BlockDescriptionNav({ idx, total, onNav }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{
      padding: "10px 16px", borderTop: `1px solid ${theme.stroke.tertiary}`,
      background: theme.bg.chrome,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    }}>
      <Button variant="ghost" disabled={idx === 0} onClick={() => onNav(-1)}>← Prev</Button>
      <span style={{ fontSize: 12, color: theme.text.tertiary, minWidth: 60, textAlign: "center" }}>
        {idx + 1} of {total}
      </span>
      <Button variant="ghost" disabled={idx === total - 1} onClick={() => onNav(1)}>Next →</Button>
    </div>
  );
}
