import {
  Card, CardBody, CardHeader,
  Divider,
  Grid,
  H1, H2,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  UsageBar,
  useHostTheme,
} from "cursor/canvas";

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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Evidence {
  desc: string;
  type: "learning" | "gitlab";
  date: string;
}
interface TrackedSkill { id: string; name: string; cat: string; ev: Evidence[]; }
interface UpdateEntry  { date: string; lang: "a" | "b"; skillId: string; desc: string; type: "learning" | "gitlab"; }

function sk(id: string, name: string, cat: string, ev: Evidence[] = []): TrackedSkill {
  return { id, name, cat, ev };
}

// ── Track A skills ────────────────────────────────────────────────────────────
// Customize these to match your actual skill track.
// The daily-debrief skill's Skill ID Reference table must match these IDs.
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

function status(sk: TrackedSkill): "mastered" | "in-progress" | "not-started" {
  if (sk.ev.length >= 3) return "mastered";
  if (sk.ev.length > 0)  return "in-progress";
  return "not-started";
}

function stats(skills: TrackedSkill[]) {
  const mastered   = skills.filter(s => s.ev.length >= 3).length;
  const inProgress = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).length;
  return {
    mastered, inProgress,
    total: skills.length,
    pct: Math.round((mastered / skills.length) * 100),
  };
}

function nextFocus(skills: TrackedSkill[]): TrackedSkill | null {
  const ip = skills
    .filter(s => s.ev.length > 0 && s.ev.length < 3)
    .sort((a, b) => b.ev.length - a.ev.length);
  if (ip.length > 0) return ip[0];
  return skills.find(s => s.ev.length === 0) ?? null;
}

function groupBy(skills: TrackedSkill[]): [string, TrackedSkill[]][] {
  const map = new Map<string, TrackedSkill[]>();
  for (const s of skills) {
    if (!map.has(s.cat)) map.set(s.cat, []);
    map.get(s.cat)!.push(s);
  }
  return Array.from(map.entries());
}

const SKILL_INDEX = new Map<string, TrackedSkill>([
  ...TRACK_A.map(s => [s.id, s] as [string, TrackedSkill]),
  ...TRACK_B.map(s => [s.id, s] as [string, TrackedSkill]),
]);

function EvidenceDots({ skill }: { skill: TrackedSkill }) {
  const theme = useHostTheme();
  const count = Math.min(skill.ev.length, 3);
  const mastered = skill.ev.length >= 3;
  const fill = mastered ? theme.category.green : theme.category.yellow;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          title={skill.ev[i]?.desc ?? "No evidence yet"}
          style={{ width: 8, height: 8, borderRadius: "50%", background: i < count ? fill : theme.stroke.secondary }}
        />
      ))}
    </div>
  );
}

function SkillRow({ skill }: { skill: TrackedSkill }) {
  const theme = useHostTheme();
  const st = status(skill);
  const latest = skill.ev[skill.ev.length - 1];
  const nameColor = st === "mastered" ? theme.text.tertiary : st === "in-progress" ? theme.text.primary : theme.text.secondary;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <EvidenceDots skill={skill} />
      <Text style={{ flex: 1, fontSize: 13, color: nameColor, textDecoration: st === "mastered" ? "line-through" : "none" }}>
        {skill.name}
      </Text>
      {st === "in-progress" && (
        <Text style={{ fontSize: 11, color: theme.category.yellow }}>
          {skill.ev.length}/3
        </Text>
      )}
      {latest && (
        <Text style={{ fontSize: 11, color: theme.text.quaternary, whiteSpace: "nowrap" }}>
          {latest.date}
        </Text>
      )}
    </div>
  );
}

function LanguageDetail({ skills }: { skills: TrackedSkill[] }) {
  return (
    <Stack gap={8}>
      {groupBy(skills).map(([cat, catSkills]) => {
        const catMastered = catSkills.filter(s => s.ev.length >= 3).length;
        return (
          <Card key={cat} collapsible defaultOpen={true}>
            <CardHeader trailing={
              catMastered > 0
                ? <Text style={{ fontSize: 11 }}>{catMastered}/{catSkills.length} mastered</Text>
                : undefined
            }>
              {cat}
            </CardHeader>
            <CardBody style={{ padding: "4px 0 4px 12px" }}>
              {catSkills.map(sk => <SkillRow key={sk.id} skill={sk} />)}
            </CardBody>
          </Card>
        );
      })}
    </Stack>
  );
}

function FocusNext() {
  const theme = useHostTheme();
  const aNext = nextFocus(TRACK_A);
  const bNext = nextFocus(TRACK_B);
  if (!aNext && !bNext) return null;
  return (
    <Stack gap={8}>
      <H2>Focus Next</H2>
      <Grid columns={2} gap={12}>
        {aNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.orange}44`, background: `${theme.category.orange}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.orange }}>{TRACK_A_NAME}</Text>
              {aNext.ev.length > 0 && (
                <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{aNext.ev.length}/3 proofs</Text>
              )}
            </Row>
            <Text style={{ fontSize: 14, color: theme.text.primary }}>{aNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary, marginTop: 2 }}>{aNext.cat}</Text>
          </div>
        )}
        {bNext && (
          <div style={{ padding: "12px 16px", borderRadius: 6, border: `1px solid ${theme.category.green}44`, background: `${theme.category.green}0A` }}>
            <Row gap={8} align="center" style={{ marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.green }}>{TRACK_B_NAME}</Text>
              {bNext.ev.length > 0 && (
                <Text style={{ fontSize: 11, color: theme.text.tertiary }}>{bNext.ev.length}/3 proofs</Text>
              )}
            </Row>
            <Text style={{ fontSize: 14, color: theme.text.primary }}>{bNext.name}</Text>
            <Text size="small" style={{ color: theme.text.tertiary, marginTop: 2 }}>{bNext.cat}</Text>
          </div>
        )}
      </Grid>
    </Stack>
  );
}

function OverviewCard({
  lang, skills, catKey,
}: {
  lang: string;
  skills: TrackedSkill[];
  catKey: "orange" | "green";
}) {
  const theme = useHostTheme();
  const { mastered, inProgress, total, pct } = stats(skills);
  const color = theme.category[catKey];
  return (
    <Card>
      <CardHeader>{lang}</CardHeader>
      <CardBody>
        <Stack gap={12}>
          <Row gap={16} align="baseline">
            <span style={{ fontSize: 36, fontWeight: 700, color, lineHeight: 1 }}>{pct}%</span>
            <Stack gap={2}>
              <Text style={{ fontSize: 13, color: theme.category.green }}>{mastered} mastered</Text>
              {inProgress > 0 && <Text style={{ fontSize: 12, color: theme.category.yellow }}>{inProgress} in progress</Text>}
              <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{total - mastered - inProgress} not started</Text>
            </Stack>
          </Row>
          <UsageBar
            total={total}
            topLeftLabel={`${mastered} / ${total} skills`}
            topRightLabel={DAYS_ELAPSED > 0 ? `day ${DAYS_ELAPSED} of ${GOAL_DAYS}` : `goal: ${GOAL_END}`}
            segments={[
              ...(mastered > 0    ? [{ id: "mastered",    value: mastered,   color: "green"  as const }] : []),
              ...(inProgress > 0  ? [{ id: "in-progress", value: inProgress, color: "yellow" as const }] : []),
            ]}
          />
          {DAYS_ELAPSED > 0 && mastered > 0 && (
            <Text style={{ fontSize: 11, color: theme.text.tertiary }}>
              {(mastered / DAYS_ELAPSED).toFixed(1)} skills/day →
              ~{Math.ceil((total - mastered) / (mastered / DAYS_ELAPSED))} days to complete
            </Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

function RecentUpdates() {
  const theme = useHostTheme();
  if (RECENT_UPDATES.length === 0) return null;
  const rows = RECENT_UPDATES.slice(0, 8).map(u => {
    const skillName = SKILL_INDEX.get(u.skillId)?.name ?? u.skillId;
    return [
      <Text size="small" style={{ color: theme.text.tertiary }}>{u.date}</Text>,
      <Text size="small" weight="medium" style={{ color: u.lang === "a" ? theme.category.orange : theme.category.green }}>
        {u.lang === "a" ? TRACK_A_NAME : TRACK_B_NAME}
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

export default function SkillTracker() {
  const theme = useHostTheme();
  const aStats = stats(TRACK_A);
  const bStats = stats(TRACK_B);

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <Stack gap={28}>

        <div>
          <H1>Skill Progression</H1>
          <Text style={{ color: theme.text.tertiary, marginTop: 4 }}>
            {PERSON_NAME} · {TRACK_A_NAME} + {TRACK_B_NAME} · {GOAL_DAYS}-day goal · {GOAL_START} → {GOAL_END}
          </Text>
          <Text style={{ color: theme.text.quaternary, fontSize: 12, marginTop: 2 }}>
            Skills mastered after 3 proofs (GitLab fixes or completed learning sessions). Updated via daily debrief.
          </Text>
        </div>

        <Grid columns={2} gap={16}>
          <OverviewCard lang={TRACK_A_NAME} skills={TRACK_A} catKey="orange" />
          <OverviewCard lang={TRACK_B_NAME} skills={TRACK_B} catKey="green"  />
        </Grid>

        <div>
          <UsageBar
            total={TRACK_A.length + TRACK_B.length}
            topLeftLabel={
              <Text style={{ fontSize: 12, fontWeight: 600, color: theme.text.secondary }}>
                Combined: {aStats.mastered + bStats.mastered} / {TRACK_A.length + TRACK_B.length} mastered
              </Text>
            }
            topRightLabel={
              <Text style={{ fontSize: 12, color: theme.text.tertiary }}>
                {Math.round(((aStats.mastered + bStats.mastered) / (TRACK_A.length + TRACK_B.length)) * 100)}% overall
              </Text>
            }
            segments={[
              ...(aStats.mastered > 0    ? [{ id: "a-m",   value: aStats.mastered,   color: "orange" as const }] : []),
              ...(aStats.inProgress > 0  ? [{ id: "a-ip",  value: aStats.inProgress, color: "yellow" as const }] : []),
              ...(bStats.mastered > 0    ? [{ id: "b-m",   value: bStats.mastered,   color: "green"  as const }] : []),
              ...(bStats.inProgress > 0  ? [{ id: "b-ip",  value: bStats.inProgress, color: "yellow" as const }] : []),
            ]}
          />
        </div>

        <FocusNext />
        <RecentUpdates />

        <Divider />

        <Stack gap={12}>
          <Row gap={12} align="center">
            <H2>{TRACK_A_NAME}</H2>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.category.orange }} />
            <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
              {aStats.mastered} mastered · {aStats.inProgress} in progress · {TRACK_A.length} total
            </Text>
          </Row>
          <LanguageDetail skills={TRACK_A} />
        </Stack>

        <Divider />

        <Stack gap={12}>
          <Row gap={12} align="center">
            <H2>{TRACK_B_NAME}</H2>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: theme.category.green }} />
            <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
              {bStats.mastered} mastered · {bStats.inProgress} in progress · {TRACK_B.length} total
            </Text>
          </Row>
          <LanguageDetail skills={TRACK_B} />
        </Stack>

        <Text style={{ color: theme.text.quaternary, fontSize: 11, textAlign: "center" }}>
          ●●● = mastered (3 proofs) · ●●○ = in progress · ○○○ = not started · Updated by daily-debrief skill
        </Text>

      </Stack>
    </div>
  );
}
