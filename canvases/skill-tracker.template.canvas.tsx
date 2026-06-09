import { Divider, Grid, useHostTheme } from "cursor/canvas";
import type { Evidence, TrackedSkill, UpdateEntry } from "../src/types";
import { sk, buildSkillIndex, skillStats } from "../src/helpers";
import { OverviewCard, FocusNext, RecentUpdates } from "../src/components/skill";
import { SkillTrackerHeader, CombinedUsageBar, TrackSection } from "../src/components/sections";

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
