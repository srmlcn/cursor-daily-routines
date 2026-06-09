// ═══════════════════════════════════════════════════════════════════════════════
// DAILY BRIEFING CANVAS — template
// Replace everything between the ══ FILL DAILY ══ markers each morning.
// The daily-briefing skill does this automatically from your config.yml.
// Visual components below the second marker never need to change.
// ═══════════════════════════════════════════════════════════════════════════════

import { Divider, Text, useCanvasState } from "cursor/canvas";
import type { EmailThread, Ticket, Block, BlockDetail, TrackedSkill, UpdateEntry, CatKey } from "../src/types";
import { sk, toMins } from "../src/helpers";
import {
  DayHeader,
  InboxSection,
  GitLabSection,
  TimelineSection,
  SkillProgressionSection,
} from "../src/components/sections";

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
