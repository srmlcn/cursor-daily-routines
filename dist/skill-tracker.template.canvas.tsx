import { Card, CardBody, CardHeader, Divider, Grid, H1, H2, Row, Stack, Table, Text, UsageBar, useHostTheme } from "cursor/canvas";

function sk(id: string, name: string, cat: string, ev: Evidence[] = []): TrackedSkill {
  return { id, name, cat, ev };
}
function skillStats(skills: TrackedSkill[]) {
  const mastered   = skills.filter(s => s.ev.length >= 3).length;
  const inProgress = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).length;
  return { mastered, inProgress, total: skills.length, pct: Math.round((mastered / skills.length) * 100) };
}
function buildSkillIndex(...tracks: TrackedSkill[][]): Map<string, TrackedSkill> {
  return new Map(tracks.flat().map(s => [s.id, s]));
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

function skillNextFocus(skills: TrackedSkill[]): TrackedSkill | null {
  const ip = skills
    .filter(s => s.ev.length > 0 && s.ev.length < 3)
    .sort((a, b) => b.ev.length - a.ev.length);
  if (ip.length > 0) return ip[0];
  return skills.find(s => s.ev.length === 0) ?? null;
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

function skillGroupBy(skills: TrackedSkill[]): [string, TrackedSkill[]][] {
  const map = new Map<string, TrackedSkill[]>();
  for (const s of skills) {
    if (!map.has(s.cat)) map.set(s.cat, []);
    map.get(s.cat)!.push(s);
  }
  return Array.from(map.entries());
}

function skillStatus(skill: TrackedSkill): "mastered" | "in-progress" | "not-started" {
  if (skill.ev.length >= 3) return "mastered";
  if (skill.ev.length > 0)  return "in-progress";
  return "not-started";
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

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL DATA — updated by the daily-debrief skill after each day's synopsis.
// Never edit the visual components below the ═══ Static visual layer marker.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Identity & goal ───────────────────────────────────────────────────────────
const PERSON_NAME  = "Your Name";         // from config.yml → name
const TRACK_A_NAME = "Ruby on Rails";     // from config.yml → track_a.name
const TRACK_B_NAME = "Vue 3";             // from config.yml → track_b.name

const GOAL_START   = "Jun 8, 2026";
const GOAL_END     = "Sep 8, 2026";
const GOAL_DAYS    = 65;
const DAYS_ELAPSED = 0;                   // incremented by daily-debrief each day

// ── Track A skills ────────────────────────────────────────────────────────────
const TRACK_A: TrackedSkill[] = [
  // Language Core
  sk("r01", "Ruby syntax & idioms",            "Language Core"),
  sk("r02", "Object-oriented Ruby",            "Language Core"),
  sk("r03", "Enumerables & iterators",         "Language Core"),
  sk("r04", "Exception handling",              "Language Core"),
  sk("r05", "Closures & metaprogramming",      "Language Core"),
  // ActiveRecord
  sk("r06", "Model basics & validations",      "ActiveRecord"),
  sk("r07", "Querying & named scopes",         "ActiveRecord"),
  sk("r08", "Nil & complex conditions",        "ActiveRecord"),
  sk("r09", "Associations",                    "ActiveRecord"),
  sk("r10", "Migrations & schema",             "ActiveRecord"),
  sk("r11", "Transactions & locking",          "ActiveRecord"),
  // Rails Patterns
  sk("r12", "Service objects (PORO)",          "Rails Patterns"),
  sk("r13", "Rake tasks",                      "Rails Patterns"),
  sk("r14", "Background jobs (Sidekiq)",       "Rails Patterns"),
  sk("r15", "Concerns & modules",              "Rails Patterns"),
  sk("r16", "Decorators & presenters",         "Rails Patterns"),
  // Testing
  sk("r17", "RSpec fundamentals",              "Testing"),
  sk("r18", "Mocks & doubles",                 "Testing"),
  sk("r19", "FactoryBot & test data",          "Testing"),
  sk("r20", "Advanced patterns",               "Testing"),
  sk("r21", "Testing rake & service objects",  "Testing"),
  // Data Ops
  sk("r22", "Bulk operations",                 "Data Ops"),
  sk("r23", "Safe deploy patterns",            "Data Ops"),
  sk("r24", "Debugging & profiling",           "Data Ops"),
];

// ── Track B skills ────────────────────────────────────────────────────────────
const TRACK_B: TrackedSkill[] = [
  // Composition API
  sk("v01", "Reactivity — ref & reactive",     "Composition API"),
  sk("v02", "computed & watch",                "Composition API"),
  sk("v03", "Lifecycle hooks",                 "Composition API"),
  sk("v04", "Template refs & defineExpose",    "Composition API"),
  sk("v05", "Async setup & Suspense",          "Composition API"),
  // Component Design
  sk("v06", "Props, emits & defineModel",      "Component Design"),
  sk("v07", "Slots",                           "Component Design"),
  sk("v08", "provide / inject",               "Component Design"),
  sk("v09", "Dynamic components & KeepAlive", "Component Design"),
  sk("v10", "Composables (useXxx pattern)",    "Component Design"),
  // Pinia
  sk("v11", "Pinia — defineStore basics",      "State · Pinia"),
  sk("v12", "storeToRefs & composition",       "State · Pinia"),
  sk("v13", "Async actions & state shapes",    "State · Pinia"),
  sk("v14", "Persisting store state",          "State · Pinia"),
  // Routing
  sk("v15", "Vue Router setup & routes",       "Routing"),
  sk("v16", "Params, guards & meta",           "Routing"),
  sk("v17", "Programmatic nav & lazy routes",  "Routing"),
  // Ecosystem
  sk("v18", "TypeScript with Vue 3",           "Ecosystem"),
  sk("v19", "Vite & project structure",        "Ecosystem"),
  sk("v20", "Custom directives & plugins",     "Ecosystem"),
  sk("v21", "Transitions & animations",        "Ecosystem"),
  // Testing
  sk("v22", "Vitest & @vue/test-utils",        "Testing"),
  sk("v23", "Testing composables & stores",    "Testing"),
  sk("v24", "Integration tests",               "Testing"),
];

// ── Recent updates (most recent first — populated by daily-debrief skill) ────
const RECENT_UPDATES: UpdateEntry[] = [
];

// ═══════════════════════════════════════════════════════════════════════════════
// Static visual layer — do not edit below this line.
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_INDEX = buildSkillIndex(TRACK_A, TRACK_B);

export default function SkillTracker() {
  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        <SkillTrackerHeader
          personName={PERSON_NAME}
          trackAName={TRACK_A_NAME}
          trackBName={TRACK_B_NAME}
          goalDays={GOAL_DAYS}
          goalStart={GOAL_START}
          goalEnd={GOAL_END}
        />

        <Grid columns={2} gap={16}>
          <OverviewCard lang={TRACK_A_NAME} skills={TRACK_A} catKey="orange" daysElapsed={DAYS_ELAPSED} goalDays={GOAL_DAYS} goalEnd={GOAL_END} />
          <OverviewCard lang={TRACK_B_NAME} skills={TRACK_B} catKey="green"  daysElapsed={DAYS_ELAPSED} goalDays={GOAL_DAYS} goalEnd={GOAL_END} />
        </Grid>

        <CombinedUsageBar trackA={TRACK_A} trackB={TRACK_B} />

        <FocusNext trackA={TRACK_A} trackB={TRACK_B} trackAName={TRACK_A_NAME} trackBName={TRACK_B_NAME} />

        <RecentUpdates
          updates={RECENT_UPDATES}
          skillIndex={SKILL_INDEX}
          trackAName={TRACK_A_NAME}
          trackBName={TRACK_B_NAME}
          maxRows={8}
        />

        <Divider />

        <TrackSection trackName={TRACK_A_NAME} skills={TRACK_A} catKey="orange" defaultOpen={true} />

        <Divider />

        <TrackSection trackName={TRACK_B_NAME} skills={TRACK_B} catKey="green" defaultOpen={true} />

      </div>
    </div>
  );
}
