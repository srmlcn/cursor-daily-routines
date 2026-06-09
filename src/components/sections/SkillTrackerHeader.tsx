import { H1, Text, useHostTheme } from "cursor/canvas";

interface Props {
  personName: string;
  trackAName: string;
  trackBName: string;
  goalDays: number;
  goalStart: string;
  goalEnd: string;
}

export function SkillTrackerHeader({ personName, trackAName, trackBName, goalDays, goalStart, goalEnd }: Props) {
  const theme = useHostTheme();
  return (
    <div>
      <H1>Skill Progression</H1>
      <Text style={{ color: theme.text.tertiary, marginTop: 4 }}>
        {personName} · {trackAName} + {trackBName} · {goalDays}-day goal · {goalStart} → {goalEnd}
      </Text>
      <Text style={{ color: theme.text.quaternary, fontSize: 12, marginTop: 2 }}>
        Skills mastered after 3 proofs (GitLab fixes or completed learning sessions). Updated via daily debrief.
      </Text>
    </div>
  );
}
