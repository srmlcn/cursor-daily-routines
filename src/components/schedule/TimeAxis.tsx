import { TimeAxisTick } from "./TimeAxisTick";

interface Tick {
  label: string;
  leftPct: string;
}

interface Props {
  ticks: Tick[];
  height: number;
}

export function TimeAxis({ ticks, height }: Props) {
  return (
    <div style={{ position: "relative", height, overflow: "hidden" }}>
      {ticks.map(tick => (
        <TimeAxisTick key={tick.leftPct} label={tick.label} leftPct={tick.leftPct} />
      ))}
    </div>
  );
}
