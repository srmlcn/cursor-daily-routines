interface Props {
  color: string;
  size?: number;
}

export function LaneDot({ color, size = 7 }: Props) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />
  );
}
