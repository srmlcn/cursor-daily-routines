// ═══════════════════════════════════════════════════════════════════════════════
// DAILY BRIEFING CANVAS — template
// Replace everything between the ══ FILL DAILY ══ markers each morning.
// The daily-briefing skill does this automatically from your config.yml.
// Visual components below the second marker never need to change.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Button,
  Card, CardBody, CardHeader,
  Callout,
  Divider,
  Grid,
  H1, H2,
  Pill,
  Row,
  Stack,
  Table,
  Text,
  UsageBar,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

// ══ FILL DAILY — start ═══════════════════════════════════════════════════════

// ── Day config ────────────────────────────────────────────────────────────────
const DATE_LABEL     = "Monday, June 9";        // e.g. "Tuesday, June 10"
const PERSON_NAME    = "Your Name";             // from config.yml → name
const COMPANY        = "yourcompany.com";       // from config.yml → company
const START_NOTE     = "10:30 AM start";        // e.g. "10:30 AM start" or "12:00 PM start (late)"
const TIMEZONE_LABEL = "EST (PST +3h)";         // from config.yml → "{timezone} ({company_timezone} +{offset}h)"

// ── Skill track display names ─────────────────────────────────────────────────
// Populated from config.yml → track_a / track_b by the daily-briefing skill.
// Also used by the static visual layer below — do not rename these constants.
const TRACK_A_NAME = "Ruby on Rails";  // track_a.name  — full name for section headers
const TRACK_A_LANE = "Ruby Dev";       // track_a.lane_label — swimlane label
const TRACK_B_NAME = "Vue 3";          // track_b.name
const TRACK_B_LANE = "Vue Dev";        // track_b.lane_label

// ── Types ─────────────────────────────────────────────────────────────────────
interface EmailThread { subject: string; participants: string[]; summary: string; action: string; }
interface Ticket { id: string; title: string; mr: string | null; mrBadge: string | null; pipelineBadge: string | null; context: string; failing: string[]; thread: string; }
interface Block { start: string; end: string; label: string; sublabel: string; type: "ticket" | "skill-a" | "skill-b" | "break" | "lunch" | "meeting" | "ramp"; }
interface BlockDetail { heading: string; description: string; bullets: string[]; note?: string; tag: string; }

// ── Inbox (top 1–3 threads needing attention) ─────────────────────────────────
const EMAIL_THREADS: EmailThread[] = [
  {
    subject: "Re: Example Thread",
    participants: ["Alice", "Bob"],
    summary: "Brief description of what happened in the thread.",
    action: "No action needed.",
  },
  // add more if needed
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
  // add more if needed
];

// ── Schedule blocks (all times 24h "HH:MM", no gaps or overlaps) ─────────────
// Default pattern: Ramp → [work blocks] → Lunch → [work blocks] → EOD
// 8 hours of work (breaks included) + 30-min lunch
// Block types: ticket · skill-a · skill-b · break · lunch · meeting · ramp
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
  // [0] Ramp-up
  {
    tag: "Ramp-up", heading: "Morning ramp-up — load context before writing code",
    description: "15 minutes to load full context. Don't write code yet — arrive at the first work block already knowing exactly what to change.",
    bullets: ["Open open tickets and MRs", "Skim any failing CI job logs", "Re-read any open review threads"],
  },
  // [1] Ticket block 1
  {
    tag: "TICKET-001", heading: "TICKET-001 — First work block heading",
    description: "What this block is specifically about and why.",
    bullets: ["Specific action 1", "Specific action 2", "Specific action 3"],
    note: "Optional context note.",
  },
  // [2] Track B block 1
  {
    tag: "Track B", heading: "Track B skill dev — first topic",
    description: "30 min of focused skill development on Track B.",
    bullets: ["Topic concept 1", "Topic concept 2", "Build a small example"],
    note: "Keep it hands-on.",
  },
  // [3] Ticket block 2
  {
    tag: "TICKET-001", heading: "TICKET-001 — Second work block heading",
    description: "Continuation of ticket work.",
    bullets: ["Specific action 1", "Specific action 2"],
  },
  // [4] Break
  { tag: "Break", heading: "Break — step away from the screen", description: "10 minutes, no screens.", bullets: [] },
  // [5] Track A block 1
  {
    tag: "Track A", heading: "Track A skill dev — first topic",
    description: "30 min of focused skill development on Track A.",
    bullets: ["Topic concept 1", "Topic concept 2", "Apply to a real example"],
  },
  // [6] Ticket block 3
  {
    tag: "TICKET-001", heading: "TICKET-001 — Third work block heading",
    description: "Continuation of ticket work.",
    bullets: ["Specific action 1", "Specific action 2"],
  },
  // [7] Lunch
  { tag: "Lunch", heading: "Lunch break — 30 minutes", description: "Away from the screen. Not counted in work total.", bullets: [] },
  // [8] Track B block 2
  {
    tag: "Track B", heading: "Track B skill dev — second topic",
    description: "30 min of focused skill development on Track B.",
    bullets: ["Topic concept 1", "Topic concept 2", "Build a composable or module"],
    note: "Focus on applying the pattern, not just reading about it.",
  },
  // [9] Ticket block 4
  {
    tag: "TICKET-001", heading: "TICKET-001 — Fourth work block heading",
    description: "Continuation of ticket work.",
    bullets: ["Specific action 1", "Specific action 2"],
  },
  // [10] Break
  { tag: "Break", heading: "Break — step away from the screen", description: "10 minutes, mid-afternoon reset.", bullets: [] },
  // [11] Track A block 2
  {
    tag: "Track A", heading: "Track A skill dev — second topic",
    description: "30 min of focused skill development on Track A.",
    bullets: ["Topic concept 1", "ENV-pattern or equivalent", "Service object extraction"],
  },
  // [12] Ticket block 5
  {
    tag: "TICKET-001", heading: "TICKET-001 — Fifth work block heading",
    description: "Continuation of ticket work.",
    bullets: ["Specific action 1", "Specific action 2"],
  },
  // [13] Break
  { tag: "Break", heading: "Break — step away from the screen", description: "10 minutes before final work block.", bullets: [] },
  // [14] Track B block 3
  {
    tag: "Track B", heading: "Track B skill dev — third topic",
    description: "30 min of focused skill development on Track B.",
    bullets: ["Topic concept 1", "Topic concept 2", "Testing the pattern"],
  },
  // [15] Ticket block 6
  {
    tag: "TICKET-001", heading: "TICKET-001 — Sixth work block heading",
    description: "Continuation of ticket work.",
    bullets: ["Specific action 1", "Specific action 2"],
  },
  // [16] Break
  { tag: "Break", heading: "Break — step away from the screen", description: "10 minutes, evening block reset.", bullets: [] },
  // [17] Track A block 3
  {
    tag: "Track A", heading: "Track A skill dev — third topic",
    description: "30 min of focused skill development on Track A.",
    bullets: ["Topic concept 1", "Testing with examples", "Factory patterns"],
  },
  // [18] Ticket finalize
  {
    tag: "TICKET-001", heading: "TICKET-001 — Finalize and merge",
    description: "Pipeline should be green. Close out the MR.",
    bullets: ["Verify all CI jobs pass", "Respond to any reviewer comments", "Merge or document stopping point"],
  },
  // [19] EOD
  {
    tag: "EOD", heading: "EOD wrap-up — close out cleanly",
    description: "15 minutes to set tomorrow up for a fast start.",
    bullets: ["Note exact stopping point", "Identify tomorrow's first task", "Reply to any same-day messages", "Close tabs and clear context"],
    note: "Default start tomorrow: check your config.yml default_start_time.",
  },
];

// ── Time constants (derived from BLOCKS above) ────────────────────────────────
// Update these when start/end times change.
const DAY_START = 10 * 60 + 30; // toMins(BLOCKS[0].start)  → 630
const DAY_END   = 18 * 60 + 45; // toMins(BLOCKS[last].end) → 1125
const DAY_TOTAL = DAY_END - DAY_START; // 495

// ── Skill data — copy TRACK_A[], TRACK_B[], SK_RECENT[], SK_DAYS_ELAPSED from skill-tracker.canvas.tsx ──
// The daily-briefing skill reads skill-tracker.canvas.tsx and pastes the current arrays here.
interface Evidence { desc: string; type: "learning" | "gitlab"; date: string; }
interface TrackedSkill { id: string; name: string; cat: string; ev: Evidence[]; }
interface SkUpdateEntry { date: string; lang: "a" | "b"; skillId: string; desc: string; type: "learning" | "gitlab"; }

function sk(id: string, name: string, cat: string, ev: Evidence[] = []): TrackedSkill {
  return { id, name, cat, ev };
}

// Track A skills — customized in your skill-tracker.canvas.tsx
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

// Track B skills — customized in your skill-tracker.canvas.tsx
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
const SK_DAYS_ELAPSED = 0; // synced from skill-tracker.canvas.tsx

const SK_RECENT: SkUpdateEntry[] = [];

// ══ FILL DAILY — end ═════════════════════════════════════════════════════════
// Everything below this line is static and should not change day-to-day.
// ═════════════════════════════════════════════════════════════════════════════

// ─── Skill helpers (static) ────────────────────────────────────────────────────

function skStats(skills: TrackedSkill[]) {
  const mastered   = skills.filter(s => s.ev.length >= 3).length;
  const inProgress = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).length;
  return { mastered, inProgress, total: skills.length, pct: Math.round((mastered / skills.length) * 100) };
}
function skNextFocus(skills: TrackedSkill[]): TrackedSkill | null {
  const ip = skills.filter(s => s.ev.length > 0 && s.ev.length < 3).sort((a, b) => b.ev.length - a.ev.length);
  if (ip.length > 0) return ip[0];
  return skills.find(s => s.ev.length === 0) ?? null;
}
function skGroupBy(skills: TrackedSkill[]): [string, TrackedSkill[]][] {
  const map = new Map<string, TrackedSkill[]>();
  for (const s of skills) { if (!map.has(s.cat)) map.set(s.cat, []); map.get(s.cat)!.push(s); }
  return Array.from(map.entries());
}
const SK_INDEX = new Map<string, TrackedSkill>([
  ...TRACK_A.map(s => [s.id, s] as [string, TrackedSkill]),
  ...TRACK_B.map(s => [s.id, s] as [string, TrackedSkill]),
]);

function SkEvidenceDots({ skill }: { skill: TrackedSkill }) {
  const theme = useHostTheme();
  const count = Math.min(skill.ev.length, 3);
  const fill  = skill.ev.length >= 3 ? theme.category.green : theme.category.yellow;
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <div key={i} title={skill.ev[i]?.desc ?? "No evidence yet"}
          style={{ width: 8, height: 8, borderRadius: "50%", background: i < count ? fill : theme.stroke.secondary }} />
      ))}
    </div>
  );
}
function SkRow({ skill }: { skill: TrackedSkill }) {
  const theme = useHostTheme();
  const st = skill.ev.length >= 3 ? "mastered" : skill.ev.length > 0 ? "in-progress" : "not-started";
  const latest = skill.ev[skill.ev.length - 1];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
      <SkEvidenceDots skill={skill} />
      <Text style={{ flex: 1, fontSize: 13, color: st === "mastered" ? theme.text.tertiary : st === "in-progress" ? theme.text.primary : theme.text.secondary, textDecoration: st === "mastered" ? "line-through" : "none" }}>
        {skill.name}
      </Text>
      {st === "in-progress" && <Text style={{ fontSize: 11, color: theme.category.yellow }}>{skill.ev.length}/3</Text>}
      {latest && <Text style={{ fontSize: 11, color: theme.text.quaternary, whiteSpace: "nowrap" }}>{latest.date}</Text>}
    </div>
  );
}
function SkLangDetail({ skills }: { skills: TrackedSkill[] }) {
  return (
    <Stack gap={8}>
      {skGroupBy(skills).map(([cat, catSkills]) => {
        const catMastered = catSkills.filter(s => s.ev.length >= 3).length;
        return (
          <Card key={cat} collapsible defaultOpen={false}>
            <CardHeader trailing={catMastered > 0 ? <Text style={{ fontSize: 11 }}>{catMastered}/{catSkills.length}</Text> : undefined}>{cat}</CardHeader>
            <CardBody style={{ padding: "4px 0 4px 12px" }}>{catSkills.map(s => <SkRow key={s.id} skill={s} />)}</CardBody>
          </Card>
        );
      })}
    </Stack>
  );
}
function SkOverviewCard({ lang, skills, catKey }: { lang: string; skills: TrackedSkill[]; catKey: "orange" | "green" }) {
  const theme = useHostTheme();
  const { mastered, inProgress, total, pct } = skStats(skills);
  const color = theme.category[catKey];
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
            topRightLabel={SK_DAYS_ELAPSED > 0 ? `day ${SK_DAYS_ELAPSED} of ${SK_GOAL_DAYS}` : `goal: ${SK_GOAL_END}`}
            segments={[
              ...(mastered   > 0 ? [{ id: "m",  value: mastered,   color: "green"  as const }] : []),
              ...(inProgress > 0 ? [{ id: "ip", value: inProgress, color: "yellow" as const }] : []),
            ]}
          />
        </Stack>
      </CardBody>
    </Card>
  );
}
function SkFocusNext() {
  const theme = useHostTheme();
  const aNext = skNextFocus(TRACK_A);
  const bNext = skNextFocus(TRACK_B);
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
              <Text weight="semibold" style={{ fontSize: 12, color: theme.category.green }}>{TRACK_B_NAME}</Text>
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
function SkRecentUpdates() {
  const theme = useHostTheme();
  if (SK_RECENT.length === 0) return null;
  const rows = SK_RECENT.slice(0, 6).map(u => {
    const skillName = SK_INDEX.get(u.skillId)?.name ?? u.skillId;
    return [
      <Text size="small" style={{ color: theme.text.tertiary }}>{u.date}</Text>,
      <Text size="small" weight="medium" style={{ color: u.lang === "a" ? theme.category.orange : theme.category.green }}>{u.lang === "a" ? TRACK_A_NAME : TRACK_B_NAME}</Text>,
      <Text size="small">{skillName}</Text>,
      <Text size="small" style={{ color: theme.text.secondary }}>{u.desc}</Text>,
    ];
  });
  return (
    <Stack gap={8}>
      <H2>Recent Evidence</H2>
      <Table headers={["Date", "Track", "Skill", "Evidence"]} rows={rows} striped columnAlign={["left", "left", "left", "left"]} />
    </Stack>
  );
}

// ─── Window config ─────────────────────────────────────────────────────────────

const WINDOW_OPTIONS = [
  { key: "1h",  label: "1h",  mins: 60       },
  { key: "2h",  label: "2h",  mins: 120      },
  { key: "4h",  label: "4h",  mins: 240      },
  { key: "all", label: "All", mins: DAY_TOTAL },
];

// ─── Lane config ──────────────────────────────────────────────────────────────

type CatKey = "blue" | "green" | "orange" | "gray" | "purple";

const LANE_DEFS: Array<{ id: string; label: string; catKey: CatKey; types: Block["type"][] }> = [
  { id: "ticket",  label: "Tickets",    catKey: "blue",   types: ["ticket"]                           },
  { id: "skill-b", label: TRACK_B_LANE, catKey: "green",  types: ["skill-b"]                          },
  { id: "skill-a", label: TRACK_A_LANE, catKey: "orange", types: ["skill-a"]                          },
  { id: "other",   label: "Other",      catKey: "gray",   types: ["break", "lunch", "meeting", "ramp"]},
];

function blockCatKey(type: Block["type"]): CatKey {
  if (type === "ticket")   return "blue";
  if (type === "skill-b")  return "green";
  if (type === "skill-a")  return "orange";
  if (type === "meeting")  return "purple";
  return "gray";
}

const LABEL_W = 88;
const ROW_H   = 54;
const AXIS_H  = 26;

// ─── Time utilities ────────────────────────────────────────────────────────────

function toMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmtMins(absMins: number): string {
  const h = Math.floor(absMins / 60);
  const m = absMins % 60;
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}`;
}

function fmtT(t: string): string { return fmtMins(toMins(t)); }

function getCurrentBlockIdx(): number {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < BLOCKS.length; i++) {
    if (nowMins >= toMins(BLOCKS[i].start) && nowMins < toMins(BLOCKS[i].end)) return i;
  }
  return nowMins < DAY_START ? 0 : BLOCKS.length - 1;
}

// ─── Swimlane ─────────────────────────────────────────────────────────────────

function Swimlane({
  displayIdx, onSelect, windowMins,
}: { displayIdx: number; onSelect: (idx: number) => void; windowMins: number }) {
  const theme = useHostTheme();
  const isAll = windowMins >= DAY_TOTAL;
  const zoomFactor = isAll ? 1 : DAY_TOTAL / windowMins;
  const toPct = (absMins: number) => `${((absMins - DAY_START) / DAY_TOTAL) * 100}%`;

  const tickInterval = windowMins <= 60 ? 15 : windowMins <= 180 ? 30 : 60;
  const ticks: Array<{ label: string; absMins: number }> = [];
  for (let m = Math.ceil(DAY_START / tickInterval) * tickInterval; m <= DAY_END; m += tickInterval) {
    ticks.push({ label: fmtMins(m), absMins: m });
  }

  const border = theme.stroke.tertiary;

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <div style={{ width: LABEL_W, flexShrink: 0 }}>
        <div style={{ height: AXIS_H }} />
        {LANE_DEFS.map((lane, i) => (
          <div key={lane.id} style={{ height: ROW_H, display: "flex", alignItems: "center", borderTop: `1px solid ${border}`, borderBottom: i === LANE_DEFS.length - 1 ? `1px solid ${border}` : "none", paddingRight: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.category[lane.catKey], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: theme.text.secondary, fontWeight: 500 }}>{lane.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minWidth: 0, overflowX: isAll ? "hidden" : "auto", overflowY: "hidden" }}>
        <div style={{ width: isAll ? "100%" : `${zoomFactor * 100}%` }}>
          <div style={{ position: "relative", height: AXIS_H, overflow: "hidden" }}>
            {ticks.map(({ label, absMins }) => (
              <span key={absMins} style={{ position: "absolute", left: toPct(absMins), top: 6, transform: "translateX(-50%)", fontSize: 11, color: theme.text.tertiary, whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none" }}>
                {label}
              </span>
            ))}
          </div>

          {LANE_DEFS.map((lane, laneIdx) => {
            const isLast = laneIdx === LANE_DEFS.length - 1;
            const color = theme.category[lane.catKey];
            return (
              <div key={lane.id} style={{ position: "relative", height: ROW_H, borderTop: `1px solid ${border}`, borderBottom: isLast ? `1px solid ${border}` : "none", overflow: "hidden" }}>
                {ticks.map(({ absMins }) => (
                  <div key={absMins} style={{ position: "absolute", left: toPct(absMins), top: 0, bottom: 0, width: 1, background: border, pointerEvents: "none" }} />
                ))}
                {BLOCKS.map((block, idx) => {
                  if (!(lane.types as string[]).includes(block.type)) return null;
                  const bStart = toMins(block.start);
                  const bEnd = toMins(block.end);
                  const durMins = bEnd - bStart;
                  const wPct = ((bEnd - bStart) / DAY_TOTAL) * 100;
                  const isSelected = idx === displayIdx;
                  const isNarrow = durMins <= 15;
                  const isLunch = block.type === "lunch";
                  return (
                    <div
                      key={idx}
                      onClick={() => onSelect(idx)}
                      title={`${fmtT(block.start)}–${fmtT(block.end)} · ${block.label}`}
                      style={{
                        position: "absolute", left: toPct(bStart), width: `${wPct}%`,
                        top: isSelected ? 5 : 8, bottom: isSelected ? 5 : 8,
                        borderRadius: 4,
                        background: isSelected ? color : isLunch ? `${color}18` : `${color}2A`,
                        border: `${isSelected ? 2 : 1.5}px ${isLunch ? "dashed" : "solid"} ${isSelected ? color : `${color}55`}`,
                        boxSizing: "border-box", overflow: "hidden", cursor: "pointer",
                        display: "flex", flexDirection: "column", justifyContent: "center",
                        padding: isNarrow ? "0 3px" : "0 7px", zIndex: isSelected ? 4 : 1,
                        transition: "top 0.1s, bottom 0.1s, background 0.12s",
                      }}
                    >
                      {!isNarrow && (
                        <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 600, color: isSelected ? color : `${color}AA`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.3 }}>
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
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Description panel ────────────────────────────────────────────────────────

function BlockDescription({ idx, onNav }: { idx: number; onNav: (delta: number) => void }) {
  const theme = useHostTheme();
  const block = BLOCKS[idx];
  const detail = BLOCK_DETAILS[idx];
  const color = theme.category[blockCatKey(block.type)];
  const durMins = toMins(block.end) - toMins(block.start);

  return (
    <div style={{ borderRadius: 8, border: `1px solid ${theme.stroke.secondary}`, borderLeft: `3px solid ${color}`, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px 10px", background: theme.bg.chrome, borderBottom: `1px solid ${theme.stroke.tertiary}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}22`, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.03em" }}>{detail.tag}</span>
          <span style={{ fontSize: 12, color: theme.text.tertiary }}>{fmtT(block.start)}–{fmtT(block.end)}</span>
          <span style={{ fontSize: 11, color: theme.text.quaternary, background: theme.fill.tertiary, padding: "2px 6px", borderRadius: 4 }}>
            {durMins} min{block.type === "lunch" ? " · not counted" : ""}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.text.primary, lineHeight: 1.4 }}>{detail.heading}</div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <Stack gap={12}>
          <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.6 }}>{detail.description}</Text>
          {detail.bullets.length > 0 && (
            <Stack gap={6}>
              {detail.bullets.map((b, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ color, fontSize: 14, lineHeight: 1.4, flexShrink: 0, marginTop: 1 }}>›</span>
                  <Text style={{ fontSize: 13, color: theme.text.secondary, lineHeight: 1.5 }}>{b}</Text>
                </div>
              ))}
            </Stack>
          )}
          {detail.note && (
            <div style={{ borderLeft: `2px solid ${theme.stroke.secondary}`, paddingLeft: 10, marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: theme.text.tertiary, fontStyle: "italic", lineHeight: 1.5 }}>{detail.note}</Text>
            </div>
          )}
        </Stack>
      </div>

      <div style={{ padding: "10px 16px", borderTop: `1px solid ${theme.stroke.tertiary}`, background: theme.bg.chrome, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Button variant="ghost" disabled={idx === 0} onClick={() => onNav(-1)}>← Prev</Button>
        <span style={{ fontSize: 12, color: theme.text.tertiary, minWidth: 60, textAlign: "center" }}>{idx + 1} of {BLOCKS.length}</span>
        <Button variant="ghost" disabled={idx === BLOCKS.length - 1} onClick={() => onNav(1)}>Next →</Button>
      </div>
    </div>
  );
}

// ─── Balance stats ────────────────────────────────────────────────────────────

function BalanceStats() {
  const theme = useHostTheme();
  const work   = BLOCKS.filter(b => b.type !== "lunch");
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
      <div style={{ width: 1, height: 14, background: theme.stroke.secondary }} />
      {([
        { label: "tickets",   mins: ticket, color: theme.category.blue  },
        { label: "skill dev", mins: skill,  color: theme.text.secondary },
        { label: "breaks",    mins: brks,   color: theme.text.tertiary  },
      ] as const).map(s => (
        <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.mins}m</span>
          <span style={{ fontSize: 11, color: theme.text.tertiary }}>{s.label}</span>
        </div>
      ))}
    </Row>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function DayBriefing() {
  const theme = useHostTheme();
  const [selIdx, setSelIdx] = useCanvasState<number | null>("selIdx", null);
  const [winKey, setWinKey] = useCanvasState<string>("winKey", "all");

  const currentIdx = getCurrentBlockIdx();
  const displayIdx = selIdx ?? currentIdx;
  const windowMins = WINDOW_OPTIONS.find(w => w.key === winKey)?.mins ?? DAY_TOTAL;

  function handleSelect(idx: number) { setSelIdx(idx === selIdx ? null : idx); }
  function handleNav(delta: number) {
    const next = displayIdx + delta;
    if (next >= 0 && next < BLOCKS.length) setSelIdx(next);
  }

  return (
    <div style={{ padding: 24, maxWidth: 980, margin: "0 auto" }}>
      <Stack gap={24}>

        <div>
          <H1>{DATE_LABEL}</H1>
          <Text style={{ color: theme.text.tertiary, marginTop: 4 }}>
            {PERSON_NAME} · {COMPANY} · {START_NOTE} · {TIMEZONE_LABEL}
          </Text>
        </div>

        {EMAIL_THREADS.length > 0 && (
          <Stack gap={10}>
            <Row gap={10} align="center">
              <H2>Inbox</H2>
              <Pill size="sm">{EMAIL_THREADS.length} thread{EMAIL_THREADS.length !== 1 ? "s" : ""}</Pill>
            </Row>
            <Stack gap={8}>
              {EMAIL_THREADS.map((t, i) => (
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
        )}

        {EMAIL_THREADS.length > 0 && <Divider />}

        {TICKETS.length > 0 && (
          <>
            <Stack gap={12}>
              <Row gap={10} align="center">
                <H2>GitLab</H2>
              </Row>
              <div style={{ display: "grid", gridTemplateColumns: TICKETS.length > 1 ? "1fr 1fr" : "1fr", gap: 16 }}>
                {TICKETS.map(t => (
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
            <Divider />
          </>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <H2>Day Timeline</H2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <BalanceStats />
            <div style={{ width: 1, height: 20, background: theme.stroke.secondary }} />
            <Row gap={6}>
              {WINDOW_OPTIONS.map(opt => (
                <Pill key={opt.key} size="sm" active={winKey === opt.key} onClick={() => setWinKey(opt.key)}>
                  {opt.label}
                </Pill>
              ))}
            </Row>
          </div>
        </div>

        <Swimlane displayIdx={displayIdx} onSelect={handleSelect} windowMins={windowMins} />
        <BlockDescription idx={displayIdx} onNav={handleNav} />

        <Divider />

        {/* Skill Progression */}
        <Stack gap={20}>
          <div>
            <H2>Skill Progression</H2>
            <Text style={{ color: theme.text.tertiary, fontSize: 12, marginTop: 2 }}>
              {SK_GOAL_START} → {SK_GOAL_END} · 3 proofs to master · updated via daily debrief
            </Text>
          </div>

          <Grid columns={2} gap={16}>
            <SkOverviewCard lang={TRACK_A_NAME} skills={TRACK_A} catKey="orange" />
            <SkOverviewCard lang={TRACK_B_NAME} skills={TRACK_B} catKey="green"  />
          </Grid>

          <UsageBar
            total={TRACK_A.length + TRACK_B.length}
            topLeftLabel={
              <Text style={{ fontSize: 12, fontWeight: 600, color: theme.text.secondary }}>
                Combined: {skStats(TRACK_A).mastered + skStats(TRACK_B).mastered} / {TRACK_A.length + TRACK_B.length} mastered
              </Text>
            }
            topRightLabel={
              <Text style={{ fontSize: 12, color: theme.text.tertiary }}>
                {Math.round(((skStats(TRACK_A).mastered + skStats(TRACK_B).mastered) / (TRACK_A.length + TRACK_B.length)) * 100)}% overall
              </Text>
            }
            segments={[
              ...(skStats(TRACK_A).mastered   > 0 ? [{ id: "a-m",  value: skStats(TRACK_A).mastered,   color: "orange" as const }] : []),
              ...(skStats(TRACK_A).inProgress > 0 ? [{ id: "a-ip", value: skStats(TRACK_A).inProgress, color: "yellow" as const }] : []),
              ...(skStats(TRACK_B).mastered   > 0 ? [{ id: "b-m",  value: skStats(TRACK_B).mastered,   color: "green"  as const }] : []),
              ...(skStats(TRACK_B).inProgress > 0 ? [{ id: "b-ip", value: skStats(TRACK_B).inProgress, color: "yellow" as const }] : []),
            ]}
          />

          <SkFocusNext />
          <SkRecentUpdates />

          <Grid columns={2} gap={12}>
            <Stack gap={8}>
              <Row gap={10} align="center">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.orange }} />
                <Text weight="semibold" style={{ color: theme.text.secondary }}>{TRACK_A_NAME}</Text>
                <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{skStats(TRACK_A).mastered}/{TRACK_A.length}</Text>
              </Row>
              <SkLangDetail skills={TRACK_A} />
            </Stack>
            <Stack gap={8}>
              <Row gap={10} align="center">
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: theme.category.green }} />
                <Text weight="semibold" style={{ color: theme.text.secondary }}>{TRACK_B_NAME}</Text>
                <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{skStats(TRACK_B).mastered}/{TRACK_B.length}</Text>
              </Row>
              <SkLangDetail skills={TRACK_B} />
            </Stack>
          </Grid>

          <Text style={{ color: theme.text.quaternary, fontSize: 11, textAlign: "center" }}>
            ●●● mastered · ●●○ in progress · ○○○ not started · categories collapsed — click to expand
          </Text>
        </Stack>

        <Text style={{ color: theme.text.quaternary, fontSize: 11, textAlign: "center" }}>
          Click a block to inspect · 1h / 2h / 4h zooms with horizontal scroll · Lunch (dashed) excluded from work total
        </Text>

      </Stack>
    </div>
  );
}
