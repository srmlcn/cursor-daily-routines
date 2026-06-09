import { Card, CardBody, CardHeader, Stack, Text } from "cursor/canvas";
import type { TrackedSkill } from "../../types";
import { skillGroupBy } from "../../helpers";
import { SkillRow } from "./SkillRow";

interface Props {
  skills: TrackedSkill[];
  defaultOpen?: boolean;
  compact?: boolean;
}

export function CategoryDetail({ skills, defaultOpen = true, compact = false }: Props) {
  return (
    <Stack gap={8}>
      {skillGroupBy(skills).map(([cat, catSkills]) => {
        const catMastered = catSkills.filter(s => s.ev.length >= 3).length;
        return (
          <Card key={cat} collapsible defaultOpen={defaultOpen}>
            <CardHeader trailing={
              catMastered > 0
                ? <Text style={{ fontSize: 11 }}>{catMastered}/{catSkills.length}</Text>
                : undefined
            }>
              {cat}
            </CardHeader>
            <CardBody style={{ padding: "4px 0 4px 12px" }}>
              {catSkills.map(sk => <SkillRow key={sk.id} skill={sk} compact={compact} />)}
            </CardBody>
          </Card>
        );
      })}
    </Stack>
  );
}
