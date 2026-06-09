interface Props {
  tag: string;
  color: string;
}

export function BlockTagBadge({ tag, color }: Props) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, color,
      background: `${color}22`, padding: "2px 8px",
      borderRadius: 4, letterSpacing: "0.03em",
    }}>
      {tag}
    </span>
  );
}
