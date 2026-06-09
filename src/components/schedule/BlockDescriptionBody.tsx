import { Stack, Text, useHostTheme } from "cursor/canvas";
import type { BlockDetail } from "../../types";
import { BlockBulletItem } from "./BlockBulletItem";
import { BlockNote } from "./BlockNote";

interface Props {
  detail: BlockDetail;
  color: string;
}

export function BlockDescriptionBody({ detail, color }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{ padding: "14px 16px" }}>
      <Stack gap={12}>
        <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.6 }}>
          {detail.description}
        </Text>
        {detail.bullets.length > 0 && (
          <Stack gap={6}>
            {detail.bullets.map((b, i) => (
              <BlockBulletItem key={i} text={b} color={color} />
            ))}
          </Stack>
        )}
        {detail.note && <BlockNote note={detail.note} />}
      </Stack>
    </div>
  );
}
