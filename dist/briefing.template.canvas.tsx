// ═══════════════════════════════════════════════════════════════════════════════
// DAILY BRIEFING CANVAS — template
// Replace everything between the ══ FILL DAILY ══ markers each morning.
// The daily-briefing skill does this automatically from your config.yml.
// Visual components below the second marker never need to change.
// ═══════════════════════════════════════════════════════════════════════════════

import { Button, Callout, Card, CardBody, CardHeader, Divider, Grid, H1, H2, Pill, Row, Stack, Table, Text, UsageBar, useCanvasState, useHostTheme } from "cursor/canvas";

function sk(id: string, name: string, cat: string, ev: Evidence[] = []): TrackedSkill {
  return { id, name, cat, ev };
}

function skillStatus(skill: TrackedSkill): "mastered" | "in-progress" | "not-started" {
  if (skill.ev.length >= 3) return "mastered";
  if (skill.ev.length > 0)  return "in-progress";
  return "not-started";
}

function skillStats(skills: TrackedSkill[]) {
  const mastered   = skills.filter(s => s.ev.length >= 3).length;
  const inProgress = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).length;
  return { mastered, inProgress, total: skills.length, pct: Math.round((mastered / skills.length) * 100) };
}

function skillNextFocus(skills: TrackedSkill[]): TrackedSkill | null {
  const ip = skills
    .filter(s => s.ev.length > 0 && s.ev.length < 3)
    .sort((a, b) => b.ev.length - a.ev.length);
  if (ip.length > 0) return ip[0];
  return skills.find(s => s.ev.length === 0) ?? null;
}

function skillGroupBy(skills: TrackedSkill[]): [string, TrackedSkill[]][] {
  const map = new Map<string, TrackedSkill[]>();
  for (const s of skills) {
    if (!map.has(s.cat)) map.set(s.cat, []);
    map.get(s.cat)!.push(s);
  }
  return Array.from(map.entries());
}

function buildSkillIndex(...tracks: TrackedSkill[][]): Map<string, TrackedSkill> {
  return new Map(tracks.flat().map(s => [s.id, s]));
}

function toMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtMins(absMins: number): string {
  const h    = Math.floor(absMins / 60);
  const m    = absMins % 60;
  const ampm = h < 12 ? "am" : "pm";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}`;
}

function fmtT(t: string): string {
  return fmtMins(toMins(t));
}

function getCurrentBlockIdx(blocks: Block[], dayStart: number, dayEnd: number): number {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < blocks.length; i++) {
    if (nowMins >= toMins(blocks[i].start) && nowMins < toMins(blocks[i].end)) return i;
  }
  return nowMins < dayStart ? 0 : blocks.length - 1;
}

function blockCatKey(type: Block["type"]): CatKey {
  if (type === "ticket")  return "blue";
  if (type === "skill-b") return "green";
  if (type === "skill-a") return "orange";
  if (type === "meeting") return "purple";
  return "gray";
}

function clamp(v: number, a = 0, b = 1) {
  return Math.max(a, Math.min(b, v));
}

function toHex(n: number) {
  const h = Math.round(clamp(n, 0, 255)).toString(16);
  return h.length === 1 ? `0${h}` : h;
}

function alphaToHex(alpha: number) {
  return toHex(Math.round(clamp(alpha, 0, 1) * 255));
}

function applyAlpha(color: string, alpha: number) {
  if (!color) return color;
  color = color.trim();
  // #rrggbb
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      return `#${hex}${alphaToHex(alpha)}`;
    }
    // already has alpha or short form - return as-is for safety
    if (hex.length === 8) return color;
    if (hex.length === 3) {
      // expand #rgb -> #rrggbb
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      return `#${r}${g}${b}${alphaToHex(alpha)}`;
    }
    return color;
  }

  // rgb(...) -> rgba(...)
  if (color.startsWith("rgb(")) {
    return color.replace(/^rgb\((.*)\)$/, `rgba($1, ${clamp(alpha)})`);
  }
  if (color.startsWith("rgba(")) {
    // replace existing alpha
    return color.replace(/rgba\((\s*[\d\.]+,\s*[\d\.]+,\s*[\d\.]+),\s*[\d\.]+\s*\)/, `rgba($1, ${clamp(alpha)})`);
  }

  // as a last resort, return original color (some CSS variables or named colors)
  return color;
}

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
}

function CombinedUsageBar({ trackA, trackB }: Props) {
  const theme  = useHostTheme();
  const aStats = skillStats(trackA);
  const bStats = skillStats(trackB);
  const total  = trackA.length + trackB.length;
  const masteredAll = aStats.mastered + bStats.mastered;
  const overallPct  = Math.round((masteredAll / total) * 100);
  return (
    <UsageBar
      total={total}
      topLeftLabel={
        <Text style={{ fontSize: 12, fontWeight: 600, color: theme.text.secondary }}>
          Combined: {masteredAll} / {total} mastered
        </Text>
      }
      topRightLabel={
        <Text style={{ fontSize: 12, color: theme.text.tertiary }}>
          {overallPct}% overall
        </Text>
      }
      segments={[
        ...(aStats.mastered   > 0 ? [{ id: "a-m",  value: aStats.mastered,   color: "orange" as const }] : []),
        ...(aStats.inProgress > 0 ? [{ id: "a-ip", value: aStats.inProgress, color: "yellow" as const }] : []),
        ...(bStats.mastered   > 0 ? [{ id: "b-m",  value: bStats.mastered,   color: "green"  as const }] : []),
        ...(bStats.inProgress > 0 ? [{ id: "b-ip", value: bStats.inProgress, color: "yellow" as const }] : []),
      ]}
    />
  );
}

interface Props {
  dateLabel: string;
  personName: string;
  company: string;
  startNote: string;
  timezoneLabel: string;
}

function DayHeader({ dateLabel, personName, company, startNote, timezoneLabel }: Props) {
  const theme = useHostTheme();
  return (
    <div>
      <H1>{dateLabel}</H1>
      <Text style={{ color: theme.text.tertiary, marginTop: 4 }}>
        {personName} · {company} · {startNote} · {timezoneLabel}
      </Text>
    </div>
  );
}

interface Props {
  tickets: Ticket[];
}

function GitLabSection({ tickets }: Props) {
  const theme = useHostTheme();
  if (tickets.length === 0) return null;
  return (
    <Stack gap={12}>
      <Row gap={10} align="center">
        <H2>GitLab</H2>
      </Row>
      <div style={{ display: "grid", gridTemplateColumns: tickets.length > 1 ? "1fr 1fr" : "1fr", gap: 16 }}>
        {tickets.map(t => (
          <Card key={t.id}>
            <CardHeader trailing={<Pill size="sm">{t.pipelineBadge ?? (t.mr ? "MR open" : "Local")}</Pill>}>
              {t.id} · {t.title}
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                {t.mr && (
                  <Row gap={8} align="center">
                    <Text size="small" style={{ color: theme.text.tertiary }}>MR</Text>
                    <Text size="small" weight="medium">{t.mr}</Text>
                    <Text size="small" style={{ color: theme.text.tertiary }}>{t.mrBadge}</Text>
                  </Row>
                )}
                <Text style={{ fontSize: 13, color: theme.text.secondary }}>{t.context}</Text>
                {t.failing.length > 0 && (
                  <Stack gap={3}>
                    <Text size="small" weight="medium">Failing jobs</Text>
                    {t.failing.map(j => (
                      <Text key={j} size="small" style={{ color: theme.text.tertiary, fontFamily: "monospace" }}>{j}</Text>
                    ))}
                  </Stack>
                )}
                <div style={{ borderLeft: `2px solid ${theme.stroke.secondary}`, paddingLeft: 8 }}>
                  <Text size="small" style={{ color: theme.text.secondary }}>{t.thread}</Text>
                </div>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </div>
    </Stack>
  );
}

interface Props {
  threads: EmailThread[];
}

function InboxSection({ threads }: Props) {
  const theme = useHostTheme();
  if (threads.length === 0) return null;
  return (
    <Stack gap={10}>
      <Row gap={10} align="center">
        <H2>Inbox</H2>
        <Pill size="sm">{threads.length} thread{threads.length !== 1 ? "s" : ""}</Pill>
      </Row>
      <Stack gap={8}>
        {threads.map((t, i) => (
          <Callout key={i} tone="info" title={t.subject}>
            <Stack gap={4}>
              <Text style={{ fontSize: 13 }}><strong>Participants:</strong> {t.participants.join(" · ")}</Text>
              <Text style={{ fontSize: 13 }}>{t.summary}</Text>
              <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>{t.action}</Text>
            </Stack>
          </Callout>
        ))}
      </Stack>
    </Stack>
  );
}

interface Props {
  skill: TrackedSkill;
}

function EvidenceDots({ skill }: Props) {
  const theme   = useHostTheme();
  const count   = Math.min(skill.ev.length, 3);
  const fill    = skill.ev.length >= 3 ? theme.category.green : theme.category.yellow;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          title={skill.ev[i]?.desc ?? "No evidence yet"}
          style={{
            width: 8, height: 8, borderRadius: "50%",
            background: i < count ? fill : theme.stroke.secondary,
          }}
        />
      ))}
    </div>
  );
}

interface Props {
  skill: TrackedSkill;
  compact?: boolean;
}

function SkillRow({ skill, compact = false }: Props) {
  const theme  = useHostTheme();
  const st     = skillStatus(skill);
  const latest = skill.ev[skill.ev.length - 1];
  const vPad   = compact ? "5px 0" : "6px 0";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: vPad, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <EvidenceDots skill={skill} />
      <Text style={{
        flex: 1, fontSize: 13,
        color: st === "mastered" ? theme.text.tertiary : st === "in-progress" ? theme.text.primary : theme.text.secondary,
        textDecoration: st === "mastered" ? "line-through" : "none",
      }}>
        {skill.name}
      </Text>
      {st === "in-progress" && (
        <Text style={{ fontSize: 11, color: theme.category.yellow }}>{skill.ev.length}/3</Text>
      )}
      {latest && (
        <Text style={{ fontSize: 11, color: theme.text.quaternary, whiteSpace: "nowrap" }}>{latest.date}</Text>
      )}
    </div>
  );
}

interface Props {
  skills: TrackedSkill[];
  defaultOpen?: boolean;
  compact?: boolean;
}

function CategoryDetail({ skills, defaultOpen = true, compact = false }: Props) {
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

interface Props {
  lang: string;
  skills: TrackedSkill[];
  catKey: "orange" | "green";
  daysElapsed?: number;
  goalDays?: number;
  goalEnd?: string;
}

function OverviewCard({ lang, skills, catKey, daysElapsed = 0, goalDays = 0, goalEnd = "" }: Props) {
  const theme                              = useHostTheme();
  const { mastered, inProgress, total, pct } = skillStats(skills);
  const color                              = theme.category[catKey];
  return (
    <Card>
      <CardHeader>{lang}</CardHeader>
      <CardBody>
        <Stack gap={10}>
          <Row gap={16} align="baseline">
            <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
            <Stack gap={2}>
              <Text style={{ fontSize: 13, color: theme.category.green }}>{mastered} mastered</Text>
              {inProgress > 0 && <Text style={{ fontSize: 12, color: theme.category.yellow }}>{inProgress} in progress</Text>}
              <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{total - mastered - inProgress} not started</Text>
            </Stack>
          </Row>
          <UsageBar
            total={total}
            topLeftLabel={`${mastered} / ${total} skills`}
            topRightLabel={daysElapsed > 0 ? `day ${daysElapsed} of ${goalDays}` : `goal: ${goalEnd}`}
            segments={[
              ...(mastered   > 0 ? [{ id: "m",  value: mastered,   color: "green"  as const }] : []),
              ...(inProgress > 0 ? [{ id: "ip", value: inProgress, color: "yellow" as const }] : []),
            ]}
          />
          {daysElapsed > 0 && mastered > 0 && (
            <Text style={{ fontSize: 11, color: theme.text.tertiary }}>
              {(mastered / daysElapsed).toFixed(1)} skills/day →
              ~{Math.ceil((total - mastered) / (mastered / daysElapsed))} days to complete
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
  trackAName: string;
  trackBName: string;
}

function FocusNext({ trackA, trackB, trackAName, trackBName }: Props) {
  const theme = useHostTheme();
  const aNext = skillNextFocus(trackA);
  const bNext = skillNextFocus(trackB);
  if (!aNext && !bNext) return null;
  return (
    <Stack gap={8}>
      <H2>Focus Next</H2>
      <Grid columns={2} gap={12}>
        {aNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.orange}44`, background: `${theme.category.orange}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.orange }}>{trackAName}</Text>
              {aNext.ev.length > 0 && <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{aNext.ev.length}/3 proofs</Text>}
            </Row>
            <Text style={{ fontSize: 14 }}>{aNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary }}>{aNext.cat}</Text>
          </div>
        )}
        {bNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.green}44`, background: `${theme.category.green}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.green }}>{trackBName}</Text>
              {bNext.ev.length > 0 && <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{bNext.ev.length}/3 proofs</Text>}
            </Row>
            <Text style={{ fontSize: 14 }}>{bNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary }}>{bNext.cat}</Text>
          </div>
        )}
      </Grid>
    </Stack>
  );
}

interface Props {
  updates: UpdateEntry[];
  skillIndex: Map<string, TrackedSkill>;
  trackAName: string;
  trackBName: string;
  maxRows?: number;
}

function RecentUpdates({ updates, skillIndex, trackAName, trackBName, maxRows = 8 }: Props) {
  const theme = useHostTheme();
  if (updates.length === 0) return null;
  const rows = updates.slice(0, maxRows).map(u => {
    const skillName = skillIndex.get(u.skillId)?.name ?? u.skillId;
    return [
      <Text size="small" style={{ color: theme.text.tertiary }}>{u.date}</Text>,
      <Text size="small" weight="medium" style={{ color: u.lang === "a" ? theme.category.orange : theme.category.green }}>
        {u.lang === "a" ? trackAName : trackBName}
      </Text>,
      <Text size="small">{skillName}</Text>,
      <Text size="small" style={{ color: theme.text.secondary }}>{u.desc}</Text>,
    ];
  });
  return (
    <Stack gap={8}>
      <H2>Recent Evidence</H2>
      <Table
        headers={["Date", "Track", "Skill", "Evidence"]}
        rows={rows}
        striped
        columnAlign={["left", "left", "left", "left"]}
      />
    </Stack>
  );
}

interface Props {
  trackA: TrackedSkill[];
  trackB: TrackedSkill[];
  trackAName: string;
  trackBName: string;
  goalStart: string;
  goalEnd: string;
  goalDays: number;
  daysElapsed: number;
  recentUpdates: UpdateEntry[];
}

function SkillProgressionSection({
  trackA, trackB, trackAName, trackBName,
  goalStart, goalEnd, goalDays, daysElapsed, recentUpdates,
}: Props) {
  const theme      = useHostTheme();
  const skillIndex = buildSkillIndex(trackA, trackB);
  const aStats     = skillStats(trackA);
  const bStats     = skillStats(trackB);
  return (
    <Stack gap={20}>
      <div>
        <H2>Skill Progression</H2>
        <Text style={{ color: theme.text.tertiary, fontSize: 12, marginTop: 2 }}>
          {goalStart} → {goalEnd} · 3 proofs to master · updated via daily debrief
        </Text>
      </div>

      <Grid columns={2} gap={16}>
        <OverviewCard lang={trackAName} skills={trackA} catKey="orange" daysElapsed={daysElapsed} goalDays={goalDays} goalEnd={goalEnd} />
        <OverviewCard lang={trackBName} skills={trackB} catKey="green"  daysElapsed={daysElapsed} goalDays={goalDays} goalEnd={goalEnd} />
      </Grid>

      <CombinedUsageBar trackA={trackA} trackB={trackB} />

      <FocusNext trackA={trackA} trackB={trackB} trackAName={trackAName} trackBName={trackBName} />

      <RecentUpdates updates={recentUpdates} skillIndex={skillIndex} trackAName={trackAName} trackBName={trackBName} maxRows={6} />

      <Grid columns={2} gap={12}>
        <Stack gap={8}>
          <Row gap={10} align="center">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
            <Text weight="semibold" style={{ color: theme.text.secondary }}>{trackAName}</Text>
            <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{aStats.mastered}/{trackA.length}</Text>
          </Row>
          <CategoryDetail skills={trackA} defaultOpen={false} compact={true} />
        </Stack>
        <Stack gap={8}>
          <Row gap={10} align="center">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
            <Text weight="semibold" style={{ color: theme.text.secondary }}>{trackBName}</Text>
            <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{bStats.mastered}/{trackB.length}</Text>
          </Row>
          <CategoryDetail skills={trackB} defaultOpen={false} compact={true} />
        </Stack>
      </Grid>

      <Text style={{ color: theme.text.quaternary, fontSize: 11, textAlign: "center" }}>
        ●●● mastered · ●●○ in progress · ○○○ not started · categories collapsed — click to expand
      </Text>
    </Stack>
  );
}

interface Props {
  personName: string;
  trackAName: string;
  trackBName: string;
  goalDays: number;
  goalStart: string;
  goalEnd: string;
}

function SkillTrackerHeader({ personName, trackAName, trackBName, goalDays, goalStart, goalEnd }: Props) {
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

interface Props {
  label: string;
  leftPct: string;
}

function TimeAxisTick({ label, leftPct }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{
      position: "absolute", left: leftPct, top: 6,
      transform: "translateX(-50%)",
      fontSize: 11, color: theme.text.tertiary,
      whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
    }}>
      {label}
    </span>
  );
}

interface Tick {
  label: string;
  leftPct: string;
}

interface Props {
  ticks: Tick[];
  height: number;
}

function TimeAxis({ ticks, height }: Props) {
  return (
    <div style={{ position: "relative", height, overflow: "hidden" }}>
      {ticks.map(tick => (
        <TimeAxisTick key={tick.leftPct} label={tick.label} leftPct={tick.leftPct} />
      ))}
    </div>
  );
}

interface Props {
  color: string;
  size?: number;
}

function LaneDot({ color, size = 7 }: Props) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0 }} />
  );
}

interface Props {
  label: string;
  color: string;
  height: number;
  borderTop: string;
  borderBottom?: string;
  paddingRight?: number;
}

function LaneLabel({ label, color, height, borderTop, borderBottom, paddingRight = 10 }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{
      height, display: "flex", alignItems: "center",
      borderTop, borderBottom,
      paddingRight,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <LaneDot color={color} />
        <span style={{ fontSize: 12, color: theme.text.secondary, fontWeight: 500 }}>{label}</span>
      </div>
    </div>
  );
}

interface Props {
  block: Block;
  blockIdx: number;
  leftPct: string;
  widthPct: string;
  isSelected: boolean;
  color: string;
  onSelect: (idx: number) => void;
}

function BlockChip({ block, blockIdx, leftPct, widthPct, isSelected, color, onSelect }: Props) {
  const theme    = useHostTheme();
  const durMins  = (parseInt(block.end.split(":")[0]) * 60 + parseInt(block.end.split(":")[1]))
                 - (parseInt(block.start.split(":")[0]) * 60 + parseInt(block.start.split(":")[1]));
  const isNarrow = durMins <= 15;
  const isLunch  = block.type === "lunch";
  const bg = isSelected ? color : isLunch ? applyAlpha(color, 0.09) : applyAlpha(color, 0.165);
  const borderColor = isSelected ? color : applyAlpha(color, 0.33);
  const labelColor = isSelected ? color : applyAlpha(color, 0.67);

  return (
    <div
      onClick={() => onSelect(blockIdx)}
      title={`${fmtT(block.start)}–${fmtT(block.end)} · ${block.label}`}
      style={{
        position: "absolute", left: leftPct, width: widthPct,
        top: isSelected ? 5 : 8, bottom: isSelected ? 5 : 8,
        borderRadius: 4,
        background: bg,
        border: `${isSelected ? 2 : 1.5}px ${isLunch ? "dashed" : "solid"} ${borderColor}`,
        boxSizing: "border-box", overflow: "hidden", cursor: "pointer",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: isNarrow ? "0 3px" : "0 7px", zIndex: isSelected ? 4 : 1,
        transition: "top 0.1s, bottom 0.1s, background 0.12s",
      }}
    >
      {!isNarrow && (
        <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 600, color: labelColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
          {block.label}
        </span>
      )}
      {!isNarrow && durMins >= 25 && (
        <span style={{ fontSize: 10, color: theme.text.secondary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3, opacity: isSelected ? 0.9 : 0.5 }}>
          {block.sublabel}
        </span>
      )}
    </div>
  );
}

interface LaneDef {
  id: string;
  types: Block["type"][];
  catKey: CatKey;
}

interface Props {
  lane: LaneDef;
  blocks: Block[];
  displayIdx: number;
  isLast: boolean;
  height: number;
  dayStart: number;
  dayTotal: number;
  ticks: Array<{ absMins: number }>;
  color: string;
  onSelect: (idx: number) => void;
}

function LaneRow({ lane, blocks, displayIdx, isLast, height, dayStart, dayTotal, ticks, color, onSelect }: Props) {
  const theme     = useHostTheme();
  const border    = theme.stroke.tertiary;
  const toPct     = (absMins: number) => `${((absMins - dayStart) / dayTotal) * 100}%`;
  return (
    <div style={{
      position: "relative", height,
      borderTop: `1px solid ${border}`,
      borderBottom: isLast ? `1px solid ${border}` : "none",
      overflow: "hidden",
    }}>
      {ticks.map(({ absMins }) => (
        <div key={absMins} style={{ position: "absolute", left: toPct(absMins), top: 0, bottom: 0, width: 1, background: border, pointerEvents: "none" }} />
      ))}
      {blocks.map((block, idx) => {
        if (!(lane.types as string[]).includes(block.type)) return null;
        const bStart  = toMins(block.start);
        const bEnd    = toMins(block.end);
        const leftPct = toPct(bStart);
        const widthPct = `${((bEnd - bStart) / dayTotal) * 100}%`;
        return (
          <BlockChip
            key={idx}
            block={block}
            blockIdx={idx}
            leftPct={leftPct}
            widthPct={widthPct}
            isSelected={idx === displayIdx}
            color={color}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
}

const LABEL_W = 88;
const ROW_H   = 54;
const AXIS_H  = 26;

interface LaneDef {
  id: string;
  label: string;
  catKey: CatKey;
  types: Block["type"][];
}

interface Props {
  blocks: Block[];
  laneDefs: LaneDef[];
  displayIdx: number;
  onSelect: (idx: number) => void;
  windowMins: number;
  dayStart: number;
  dayEnd: number;
  dayTotal: number;
}

function Swimlane({ blocks, laneDefs, displayIdx, onSelect, windowMins, dayStart, dayEnd, dayTotal }: Props) {
  const theme      = useHostTheme();
  const isAll      = windowMins >= dayTotal;
  const zoomFactor = isAll ? 1 : dayTotal / windowMins;
  const toPct      = (absMins: number) => `${((absMins - dayStart) / dayTotal) * 100}%`;
  const border     = theme.stroke.tertiary;

  const tickInterval = windowMins <= 60 ? 15 : windowMins <= 180 ? 30 : 60;
  const ticks: Array<{ label: string; absMins: number; leftPct: string }> = [];
  for (let m = Math.ceil(dayStart / tickInterval) * tickInterval; m <= dayEnd; m += tickInterval) {
    ticks.push({ label: fmtMins(m), absMins: m, leftPct: toPct(m) });
  }

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <div style={{ width: LABEL_W, flexShrink: 0 }}>
        <div style={{ height: AXIS_H }} />
        {laneDefs.map((lane, i) => (
          <LaneLabel
            key={lane.id}
            label={lane.label}
            color={theme.category[lane.catKey]}
            height={ROW_H}
            borderTop={`1px solid ${border}`}
            borderBottom={i === laneDefs.length - 1 ? `1px solid ${border}` : undefined}
            paddingRight={10}
          />
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflowX: isAll ? "hidden" : "auto", overflowY: "hidden" }}>
        <div style={{ width: isAll ? "100%" : `${zoomFactor * 100}%` }}>
          <TimeAxis ticks={ticks} height={AXIS_H} />
          {laneDefs.map((lane, i) => (
            <LaneRow
              key={lane.id}
              lane={lane}
              blocks={blocks}
              displayIdx={displayIdx}
              isLast={i === laneDefs.length - 1}
              height={ROW_H}
              dayStart={dayStart}
              dayTotal={dayTotal}
              ticks={ticks}
              color={theme.category[lane.catKey]}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface Props {
  tag: string;
  color: string;
}

function BlockTagBadge({ tag, color }: Props) {
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

interface Props {
  start: string;
  end: string;
}

function BlockTimeMeta({ start, end }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{ fontSize: 12, color: theme.text.tertiary }}>
      {fmtT(start)}–{fmtT(end)}
    </span>
  );
}

interface Props {
  durationMins: number;
  excluded?: boolean;
}

function BlockDurationPill({ durationMins, excluded = false }: Props) {
  const theme = useHostTheme();
  return (
    <span style={{ fontSize: 11, color: theme.text.quaternary, background: theme.fill.tertiary, padding: "2px 6px", borderRadius: 4 }}>
      {durationMins} min{excluded ? " · not counted" : ""}
    </span>
  );
}

interface Props {
  text: string;
  color: string;
}

function BlockBulletItem({ text, color }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ color, fontSize: 14, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>›</span>
      <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.5 }}>{text}</Text>
    </div>
  );
}

interface Props {
  note: string;
}

function BlockNote({ note }: Props) {
  const theme = useHostTheme();
  return (
    <div style={{ borderLeft: `2px solid ${theme.stroke.secondary}`, paddingLeft: 10, marginTop: 2 }}>
      <Text style={{ fontSize: 12, color: theme.text.tertiary, fontStyle: "italic", lineHeight: 1.5 }}>
        {note}
      </Text>
    </div>
  );
}

interface Props {
  block: Block;
  detail: BlockDetail;
  color: string;
}

function BlockDescriptionHeader({ block, detail, color }: Props) {
  const theme      = useHostTheme();
  const durationMins = toMins(block.end) - toMins(block.start);
  return (
    <div style={{ padding: "12px 16px 10px", background: theme.bg.chrome, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <BlockTagBadge tag={detail.tag} color={color} />
        <BlockTimeMeta start={block.start} end={block.end} />
        <BlockDurationPill durationMins={durationMins} excluded={block.type === "lunch"} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: theme.text.primary, lineHeight: 1.4 }}>
        {detail.heading}
      </div>
    </div>
  );
}

interface Props {
  detail: BlockDetail;
  color: string;
}

function BlockDescriptionBody({ detail, color }: Props) {
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

interface Props {
  idx: number;
  total: number;
  onNav: (delta: number) => void;
}

function BlockDescriptionNav({ idx, total, onNav }: Props) {
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

interface Props {
  block: Block;
  detail: BlockDetail;
  idx: number;
  total: number;
  onNav: (delta: number) => void;
}

function BlockDescription({ block, detail, idx, total, onNav }: Props) {
  const theme = useHostTheme();
  const color = theme.category[blockCatKey(block.type)];
  return (
    <div style={{ borderRadius: 8, border: `1px solid ${theme.stroke.secondary}`, borderLeft: `3px solid ${color}`, overflow: "hidden" }}>
      <BlockDescriptionHeader block={block} detail={detail} color={color} />
      <BlockDescriptionBody detail={detail} color={color} />
      <BlockDescriptionNav idx={idx} total={total} onNav={onNav} />
    </div>
  );
}

function StatSeparator() {
  const theme = useHostTheme();
  return <div style={{ width: 1, height: 14, background: theme.stroke.secondary }} />;
}

interface Props {
  label: string;
  mins: number;
  color?: string;
}

function WorkStatItem({ label, mins, color }: Props) {
  const theme      = useHostTheme();
  const textColor  = color ?? theme.text.secondary;
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: textColor, lineHeight: 1 }}>{mins}m</span>
      <span style={{ fontSize: 11, color: theme.text.tertiary }}>{label}</span>
    </div>
  );
}

interface Props {
  blocks: Block[];
}

function BalanceStats({ blocks }: Props) {
  const theme  = useHostTheme();
  const work   = blocks.filter(b => b.type !== "lunch");
  const ticket = work.filter(b => b.type === "ticket").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const skill  = work.filter(b => b.type === "skill-a" || b.type === "skill-b").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const brks   = work.filter(b => b.type === "break").reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const total  = work.reduce((s, b) => s + toMins(b.end) - toMins(b.start), 0);
  const totalH = Math.floor(total / 60);
  const totalM = total % 60;
  return (
    <Row gap={16} align="center">
      <span style={{ fontSize: 13, color: theme.text.tertiary, fontWeight: 500 }}>
        {totalH}h{totalM > 0 ? `${totalM}m` : ""} work
      </span>
      <StatSeparator />
      <WorkStatItem label="tickets"   mins={ticket} color={theme.category.blue} />
      <WorkStatItem label="skill dev" mins={skill} />
      <WorkStatItem label="breaks"    mins={brks}   color={theme.text.tertiary} />
    </Row>
  );
}

interface LaneDef {
  id: string;
  label: string;
  catKey: CatKey;
  types: Block["type"][];
}

interface WindowOption {
  key: string;
  label: string;
  mins: number;
}

interface Props {
  blocks: Block[];
  blockDetails: BlockDetail[];
  laneDefs: LaneDef[];
  windowOptions: WindowOption[];
  displayIdx: number;
  winKey: string;
  dayStart: number;
  dayEnd: number;
  dayTotal: number;
  onSelect: (idx: number) => void;
  onNav: (delta: number) => void;
  onWinKey: (key: string) => void;
}

function TimelineSection({
  blocks, blockDetails, laneDefs, windowOptions,
  displayIdx, winKey, dayStart, dayEnd, dayTotal,
  onSelect, onNav, onWinKey,
}: Props) {
  const theme      = useHostTheme();
  const windowMins = windowOptions.find(w => w.key === winKey)?.mins ?? dayTotal;
  return (
    <Stack gap={16}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <H2>Day Timeline</H2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <BalanceStats blocks={blocks} />
          <div style={{ width: 1, height: 20, background: theme.stroke.secondary }} />
          <Row gap={6}>
            {windowOptions.map(opt => (
              <Pill key={opt.key} size="sm" active={winKey === opt.key} onClick={() => onWinKey(opt.key)}>
                {opt.label}
              </Pill>
            ))}
          </Row>
        </div>
      </div>

      <Swimlane
        blocks={blocks}
        laneDefs={laneDefs}
        displayIdx={displayIdx}
        onSelect={onSelect}
        windowMins={windowMins}
        dayStart={dayStart}
        dayEnd={dayEnd}
        dayTotal={dayTotal}
      />

      <BlockDescription
        block={blocks[displayIdx]}
        detail={blockDetails[displayIdx]}
        idx={displayIdx}
        total={blocks.length}
        onNav={onNav}
      />
    </Stack>
  );
}

interface Props {
  trackName: string;
  skills: TrackedSkill[];
  catKey: "orange" | "green";
  defaultOpen?: boolean;
  compact?: boolean;
}

function TrackSection({ trackName, skills, catKey, defaultOpen = true, compact = false }: Props) {
  const theme  = useHostTheme();
  const { mastered, inProgress, total } = skillStats(skills);
  return (
    <Stack gap={12}>
      <Row gap={12} align="center">
        <H2>{trackName}</H2>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.category[catKey] }} />
        <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
          {mastered} mastered · {inProgress} in progress · {total} total
        </Text>
      </Row>
      <CategoryDetail skills={skills} defaultOpen={defaultOpen} compact={compact} />
    </Stack>
  );
}

// ══ FILL DAILY — start ═══════════════════════════════════════════════════════

// ── Day config ────────────────────────────────────────────────────────────────
const DATE_LABEL     = "Monday, June 9";        // e.g. "Tuesday, June 10"
const PERSON_NAME    = "Your Name";             // from config.yml → name
const COMPANY        = "yourcompany.com";       // from config.yml → company
const START_NOTE     = "10:30 AM start";        // e.g. "10:30 AM start" or "12:00 PM start (late)"
const TIMEZONE_LABEL = "EST (PST +3h)";         // from config.yml → "{timezone} ({company_timezone} +{offset}h)"

// ── Skill track display names ─────────────────────────────────────────────────
const TRACK_A_NAME = "Ruby on Rails";  // track_a.name  — full name for section headers
const TRACK_A_LANE = "Ruby Dev";       // track_a.lane_label — swimlane label
const TRACK_B_NAME = "Vue 3";          // track_b.name
const TRACK_B_LANE = "Vue Dev";        // track_b.lane_label

// ── Inbox (top 1–3 threads needing attention) ─────────────────────────────────
const EMAIL_THREADS: EmailThread[] = [
  {
    subject: "Re: Example Thread",
    participants: ["Alice", "Bob"],
    summary: "Brief description of what happened in the thread.",
    action: "No action needed.",
  },
];

// ── GitLab tickets and MRs ────────────────────────────────────────────────────
const TICKETS: Ticket[] = [
  {
    id: "TICKET-001",
    title: "Short ticket title",
    mr: null,
    mrBadge: null,
    pipelineBadge: null,
    context: "One or two sentences describing the current state of this ticket.",
    failing: [],
    thread: "Next action or open review comment.",
  },
];

// ── Schedule blocks (all times 24h "HH:MM", no gaps or overlaps) ─────────────
const BLOCKS: Block[] = [
  { start: "10:30", end: "10:45", label: "Ramp-up",    sublabel: "Review brief + open tickets",              type: "ramp"    },
  { start: "10:45", end: "11:15", label: "TICKET-001", sublabel: "First work block description",             type: "ticket"  },
  { start: "11:15", end: "11:45", label: "Track B",    sublabel: "Composition API — ref, computed, watch",   type: "skill-b" },
  { start: "11:45", end: "12:15", label: "TICKET-001", sublabel: "Second ticket work block",                 type: "ticket"  },
  { start: "12:15", end: "12:25", label: "Break",      sublabel: "Step away, recharge",                     type: "break"   },
  { start: "12:25", end: "12:55", label: "Track A",    sublabel: "ActiveRecord scopes and patterns",         type: "skill-a" },
  { start: "12:55", end: "13:25", label: "TICKET-001", sublabel: "Third ticket work block",                  type: "ticket"  },
  { start: "13:25", end: "13:55", label: "Lunch",      sublabel: "30-min break — not counted",               type: "lunch"   },
  { start: "13:55", end: "14:25", label: "Track B",    sublabel: "Component architecture — slots, Pinia",    type: "skill-b" },
  { start: "14:25", end: "14:55", label: "TICKET-001", sublabel: "Fourth ticket work block",                 type: "ticket"  },
  { start: "14:55", end: "15:05", label: "Break",      sublabel: "Step away, recharge",                     type: "break"   },
  { start: "15:05", end: "15:35", label: "Track A",    sublabel: "Rake task patterns and testing",           type: "skill-a" },
  { start: "15:35", end: "16:05", label: "TICKET-001", sublabel: "Fifth ticket work block",                  type: "ticket"  },
  { start: "16:05", end: "16:15", label: "Break",      sublabel: "Step away, recharge",                     type: "break"   },
  { start: "16:15", end: "16:45", label: "Track B",    sublabel: "Testing — Vitest, component mounting",     type: "skill-b" },
  { start: "16:45", end: "17:15", label: "TICKET-001", sublabel: "Sixth ticket work block",                  type: "ticket"  },
  { start: "17:15", end: "17:25", label: "Break",      sublabel: "Step away, recharge",                     type: "break"   },
  { start: "17:25", end: "17:55", label: "Track A",    sublabel: "RSpec patterns and service objects",       type: "skill-a" },
  { start: "17:55", end: "18:30", label: "TICKET-001", sublabel: "Finalize and wrap up",                     type: "ticket"  },
  { start: "18:30", end: "18:45", label: "EOD",        sublabel: "Note stopping point; set up tomorrow",     type: "ramp"    },
];

// ── Block details (one entry per block — MUST match BLOCKS length and order) ──
const BLOCK_DETAILS: BlockDetail[] = [
  { tag: "Ramp-up",    heading: "Morning ramp-up — load context before writing code",    description: "15 minutes to load full context. Don't write code yet — arrive at the first work block already knowing exactly what to change.", bullets: ["Open open tickets and MRs", "Skim any failing CI job logs", "Re-read any open review threads"] },
  { tag: "TICKET-001", heading: "TICKET-001 — First work block heading",                description: "What this block is specifically about and why.",                  bullets: ["Specific action 1", "Specific action 2", "Specific action 3"], note: "Optional context note." },
  { tag: "Track B",    heading: "Track B skill dev — first topic",                      description: "30 min of focused skill development on Track B.",                 bullets: ["Topic concept 1", "Topic concept 2", "Build a small example"],   note: "Keep it hands-on." },
  { tag: "TICKET-001", heading: "TICKET-001 — Second work block heading",               description: "Continuation of ticket work.",                                    bullets: ["Specific action 1", "Specific action 2"] },
  { tag: "Break",      heading: "Break — step away from the screen",                    description: "10 minutes, no screens.",                                         bullets: [] },
  { tag: "Track A",    heading: "Track A skill dev — first topic",                      description: "30 min of focused skill development on Track A.",                 bullets: ["Topic concept 1", "Topic concept 2", "Apply to a real example"] },
  { tag: "TICKET-001", heading: "TICKET-001 — Third work block heading",                description: "Continuation of ticket work.",                                    bullets: ["Specific action 1", "Specific action 2"] },
  { tag: "Lunch",      heading: "Lunch break — 30 minutes",                             description: "Away from the screen. Not counted in work total.",                bullets: [] },
  { tag: "Track B",    heading: "Track B skill dev — second topic",                     description: "30 min of focused skill development on Track B.",                 bullets: ["Topic concept 1", "Topic concept 2", "Build a composable or module"], note: "Focus on applying the pattern, not just reading about it." },
  { tag: "TICKET-001", heading: "TICKET-001 — Fourth work block heading",               description: "Continuation of ticket work.",                                    bullets: ["Specific action 1", "Specific action 2"] },
  { tag: "Break",      heading: "Break — step away from the screen",                    description: "10 minutes, mid-afternoon reset.",                                bullets: [] },
  { tag: "Track A",    heading: "Track A skill dev — second topic",                     description: "30 min of focused skill development on Track A.",                 bullets: ["Topic concept 1", "ENV-pattern or equivalent", "Service object extraction"] },
  { tag: "TICKET-001", heading: "TICKET-001 — Fifth work block heading",                description: "Continuation of ticket work.",                                    bullets: ["Specific action 1", "Specific action 2"] },
  { tag: "Break",      heading: "Break — step away from the screen",                    description: "10 minutes before final work block.",                             bullets: [] },
  { tag: "Track B",    heading: "Track B skill dev — third topic",                      description: "30 min of focused skill development on Track B.",                 bullets: ["Topic concept 1", "Topic concept 2", "Testing the pattern"] },
  { tag: "TICKET-001", heading: "TICKET-001 — Sixth work block heading",                description: "Continuation of ticket work.",                                    bullets: ["Specific action 1", "Specific action 2"] },
  { tag: "Break",      heading: "Break — step away from the screen",                    description: "10 minutes, evening block reset.",                                bullets: [] },
  { tag: "Track A",    heading: "Track A skill dev — third topic",                      description: "30 min of focused skill development on Track A.",                 bullets: ["Topic concept 1", "Testing with examples", "Factory patterns"] },
  { tag: "TICKET-001", heading: "TICKET-001 — Finalize and merge",                      description: "Pipeline should be green. Close out the MR.",                     bullets: ["Verify all CI jobs pass", "Respond to any reviewer comments", "Merge or document stopping point"] },
  { tag: "EOD",        heading: "EOD wrap-up — close out cleanly",                      description: "15 minutes to set tomorrow up for a fast start.",                 bullets: ["Note exact stopping point", "Identify tomorrow's first task", "Reply to any same-day messages", "Close tabs and clear context"], note: "Default start tomorrow: check your config.yml default_start_time." },
];

// ── Time constants (derived from BLOCKS above) ────────────────────────────────
const DAY_START = toMins(BLOCKS[0].start);
const DAY_END   = toMins(BLOCKS[BLOCKS.length - 1].end);
const DAY_TOTAL = DAY_END - DAY_START;

// ── Skill data ────────────────────────────────────────────────────────────────
const TRACK_A: TrackedSkill[] = [
  sk("r01", "Ruby syntax & idioms",           "Language Core"),
  sk("r02", "Object-oriented Ruby",           "Language Core"),
  sk("r03", "Enumerables & iterators",        "Language Core"),
  sk("r04", "Exception handling",             "Language Core"),
  sk("r05", "Closures & metaprogramming",     "Language Core"),
  sk("r06", "Model basics & validations",     "ActiveRecord"),
  sk("r07", "Querying & named scopes",        "ActiveRecord"),
  sk("r08", "Nil & complex conditions",       "ActiveRecord"),
  sk("r09", "Associations",                   "ActiveRecord"),
  sk("r10", "Migrations & schema",            "ActiveRecord"),
  sk("r11", "Transactions & locking",         "ActiveRecord"),
  sk("r12", "Service objects (PORO)",         "Rails Patterns"),
  sk("r13", "Rake tasks",                     "Rails Patterns"),
  sk("r14", "Background jobs (Sidekiq)",      "Rails Patterns"),
  sk("r15", "Concerns & modules",             "Rails Patterns"),
  sk("r16", "Decorators & presenters",        "Rails Patterns"),
  sk("r17", "RSpec fundamentals",             "Testing"),
  sk("r18", "Mocks & doubles",                "Testing"),
  sk("r19", "FactoryBot & test data",         "Testing"),
  sk("r20", "Advanced patterns",              "Testing"),
  sk("r21", "Testing rake & service objects", "Testing"),
  sk("r22", "Bulk operations",                "Data Ops"),
  sk("r23", "Safe deploy patterns",           "Data Ops"),
  sk("r24", "Debugging & profiling",          "Data Ops"),
];

const TRACK_B: TrackedSkill[] = [
  sk("v01", "Reactivity — ref & reactive",    "Composition API"),
  sk("v02", "computed & watch",               "Composition API"),
  sk("v03", "Lifecycle hooks",                "Composition API"),
  sk("v04", "Template refs & defineExpose",   "Composition API"),
  sk("v05", "Async setup & Suspense",         "Composition API"),
  sk("v06", "Props, emits & defineModel",     "Component Design"),
  sk("v07", "Slots",                          "Component Design"),
  sk("v08", "provide / inject",              "Component Design"),
  sk("v09", "Dynamic components & KeepAlive","Component Design"),
  sk("v10", "Composables (useXxx pattern)",   "Component Design"),
  sk("v11", "Pinia — defineStore basics",     "State · Pinia"),
  sk("v12", "storeToRefs & composition",      "State · Pinia"),
  sk("v13", "Async actions & state shapes",   "State · Pinia"),
  sk("v14", "Persisting store state",         "State · Pinia"),
  sk("v15", "Vue Router setup & routes",      "Routing"),
  sk("v16", "Params, guards & meta",          "Routing"),
  sk("v17", "Programmatic nav & lazy routes", "Routing"),
  sk("v18", "TypeScript with Vue 3",          "Ecosystem"),
  sk("v19", "Vite & project structure",       "Ecosystem"),
  sk("v20", "Custom directives & plugins",    "Ecosystem"),
  sk("v21", "Transitions & animations",       "Ecosystem"),
  sk("v22", "Vitest & @vue/test-utils",       "Testing"),
  sk("v23", "Testing composables & stores",   "Testing"),
  sk("v24", "Integration tests",              "Testing"),
];

const SK_GOAL_START   = "Jun 8, 2026";
const SK_GOAL_END     = "Sep 8, 2026";
const SK_GOAL_DAYS    = 65;
const SK_DAYS_ELAPSED = 0;

const SK_RECENT: UpdateEntry[] = [];

// ══ FILL DAILY — end ═════════════════════════════════════════════════════════
// Everything below this line is static and should not change day-to-day.
// ═════════════════════════════════════════════════════════════════════════════

const WINDOW_OPTIONS = [
  { key: "1h",  label: "1h",  mins: 60       },
  { key: "2h",  label: "2h",  mins: 120      },
  { key: "4h",  label: "4h",  mins: 240      },
  { key: "all", label: "All", mins: DAY_TOTAL },
];

const LANE_DEFS: Array<{ id: string; label: string; catKey: CatKey; types: Block["type"][] }> = [
  { id: "ticket",  label: "Tickets",    catKey: "blue",   types: ["ticket"]                            },
  { id: "skill-b", label: TRACK_B_LANE, catKey: "green",  types: ["skill-b"]                           },
  { id: "skill-a", label: TRACK_A_LANE, catKey: "orange", types: ["skill-a"]                           },
  { id: "other",   label: "Other",      catKey: "gray",   types: ["break", "lunch", "meeting", "ramp"] },
];

function getCurrentBlockIdx(): number {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < BLOCKS.length; i++) {
    if (nowMins >= toMins(BLOCKS[i].start) && nowMins < toMins(BLOCKS[i].end)) return i;
  }
  return nowMins < DAY_START ? 0 : BLOCKS.length - 1;
}

export default function DayBriefing() {
  const [selIdx, setSelIdx] = useCanvasState<number | null>("selIdx", null);
  const [winKey, setWinKey] = useCanvasState<string>("winKey", "all");

  const currentIdx  = getCurrentBlockIdx();
  const displayIdx  = selIdx ?? currentIdx;

  function handleSelect(idx: number) { setSelIdx(idx === selIdx ? null : idx); }
  function handleNav(delta: number) {
    const next = displayIdx + delta;
    if (next >= 0 && next < BLOCKS.length) setSelIdx(next);
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        <DayHeader
          dateLabel={DATE_LABEL}
          personName={PERSON_NAME}
          company={COMPANY}
          startNote={START_NOTE}
          timezoneLabel={TIMEZONE_LABEL}
        />

        <InboxSection threads={EMAIL_THREADS} />
        {EMAIL_THREADS.length > 0 && <Divider />}

        <GitLabSection tickets={TICKETS} />
        {TICKETS.length > 0 && <Divider />}

        <TimelineSection
          blocks={BLOCKS}
          blockDetails={BLOCK_DETAILS}
          laneDefs={LANE_DEFS}
          windowOptions={WINDOW_OPTIONS}
          displayIdx={displayIdx}
          winKey={winKey}
          dayStart={DAY_START}
          dayEnd={DAY_END}
          dayTotal={DAY_TOTAL}
          onSelect={handleSelect}
          onNav={handleNav}
          onWinKey={setWinKey}
        />

        <Divider />

        <SkillProgressionSection
          trackA={TRACK_A}
          trackB={TRACK_B}
          trackAName={TRACK_A_NAME}
          trackBName={TRACK_B_NAME}
          goalStart={SK_GOAL_START}
          goalEnd={SK_GOAL_END}
          goalDays={SK_GOAL_DAYS}
          daysElapsed={SK_DAYS_ELAPSED}
          recentUpdates={SK_RECENT}
        />

        <Text style={{ color: "#00000044", fontSize: 11, textAlign: "center" }}>
          Click a block to inspect · 1h / 2h / 4h zooms with horizontal scroll · Lunch (dashed) excluded from work total
        </Text>

      </div>
    </div>
  );
}
