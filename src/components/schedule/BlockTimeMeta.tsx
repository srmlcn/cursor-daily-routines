import { useHostTheme } from "cursor/canvas";
import { fmtT } from "../../helpers";

interface Props {
  start: string;
  end: string;
}

export function BlockTimeMeta({ start, end }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{ fontSize: 12, color: theme.text.tertiary }}>
      {fmtT(start)}–{fmtT(end)}
    </span>
  );
}
