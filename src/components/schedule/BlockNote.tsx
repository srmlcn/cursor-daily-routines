import { Text, useHostTheme } from "cursor/canvas";

interface Props {
  note: string;
}

export function BlockNote({ note }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{ borderLeft: `2px solid ${theme.stroke.secondary}`, paddingLeft: 10, marginTop: 2 }}>
      <Text style={{ fontSize: 12, color: theme.text.tertiary, fontStyle: "italic", lineHeight: 1.5 }}>
        {note}
      </Text>
    </div>
  );
}
