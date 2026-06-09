import { Text, useHostTheme } from "cursor/canvas";

interface Props {
  text: string;
  color: string;
}

export function BlockBulletItem({ text, color }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ color, fontSize: 14, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>›</span>
      <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.5 }}>{text}</Text>
    </div>
  );
}
