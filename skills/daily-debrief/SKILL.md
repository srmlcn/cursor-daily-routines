---
name: daily-debrief
description: >-
  Process your end-of-day synopsis to update skill mastery progress.
  Maps today's learning and GitLab work to skill IDs, adds evidence to the
  skill-tracker canvas, increments DAYS_ELAPSED, and recommends tomorrow's
  learning focus for both skill tracks. Use when you say things like
  "here's what I did today", "daily debrief", "end of day", or "I worked on X".
triggers:
  - daily debrief
  - end of day
  - here's what i did
  - synopsis
output: skill-tracker.canvas.tsx (SKILL DATA section only)
---

# Daily Debrief Skill

Process your end-of-day synopsis and update the skill tracker.

---

## Step 0 — Load personal config

Read `~/.cursor/skills/config.yml`.

Extract:
- `name`         → for responses
- `track_a`      → skill track A (name, short)
- `track_b`      → skill track B (name, short)
- `canvases_dir`             → long-term canvas archive
- `workspace_canvases_dir`   → live Canvas panel folder

---

## Step 1 — Read the current tracker

Read `{canvases_dir}/skill-tracker.canvas.tsx` to understand the current state of
`TRACK_A`, `TRACK_B`, `RECENT_UPDATES`, and `DAYS_ELAPSED`.

---

## Step 2 — Parse the synopsis

From the user's message identify:

1. **Work items** — ticket IDs, MR numbers, or bug descriptions.
   Map to the appropriate skill(s). Type = `"gitlab"`.

2. **Learning sessions** — topic descriptions.
   Map to skill ID(s). Type = `"learning"`.

3. **Only add evidence if the user actually engaged with the concept** — a skill
   that was merely mentioned or planned but not touched does not earn evidence.
   A skill used in a real fix or a focused learning block does.

Refer to the **Skill ID Reference** table at the bottom of this file to map
descriptions to skill IDs. Update that table if you've customized your skill list.

---

## Step 3 — Build new evidence entries

For each identified skill:

```ts
{ desc: "<concise description of what was done>", type: "learning" | "gitlab", date: "<today's date, e.g. Jun 8, 2026>" }
```

Append each entry to the correct skill's `ev: []` array inside `TRACK_A` or `TRACK_B`.

---

## Step 4 — Apply mastery rule

A skill is **mastered** when `ev.length >= 3`. The canvas computes this automatically.

If a skill just reached 3 proofs today, note it in your response:
> "🎉 **r08 — Nil & complex conditions** is now mastered."

---

## Step 5 — Update RECENT_UPDATES

Prepend new `UpdateEntry` objects to `RECENT_UPDATES` (most recent first).
Keep at most 20 entries in the array.

```ts
{ date: "<today>", lang: "a" | "b", skillId: "<id>", desc: "<short desc>", type: "learning" | "gitlab" }
```

Use `lang: "a"` for track A skills and `lang: "b"` for track B skills.

---

## Step 6 — Increment DAYS_ELAPSED

Increment `DAYS_ELAPSED` by 1 in the canvas file.

---

## Step 7 — Write the updated file

Use StrReplace to update the SKILL DATA section of `{canvases_dir}/skill-tracker.canvas.tsx`.
Only modify the data section (between the two `═══ SKILL DATA` markers).
Never touch anything below `═══ Static visual layer`.

---

## Step 8 — Sync to workspace canvases

Copy `{canvases_dir}/skill-tracker.canvas.tsx` to `{workspace_canvases_dir}/skill-tracker.canvas.tsx`.
Create `workspace_canvases_dir` if it does not exist.

This copy is what Cursor renders in the Canvas panel. The archive at `canvases_dir` remains the canonical source.

---

## Step 9 — Write the daily log entry

After updating the skill tracker, append a JSON log file to `logs_dir` from config.

**File path:** `{logs_dir}/YYYY-MM-DD-debrief.json`  
(Use today's date. Create the directory if it does not exist.)

**Schema:**

```json
{
  "date": "YYYY-MM-DD",
  "days_elapsed": <new DAYS_ELAPSED value>,
  "skills_updated": [
    { "id": "<skill id>", "track": "a" | "b", "evidence_type": "learning" | "gitlab", "desc": "<desc>" }
  ],
  "newly_mastered": ["<skill id>", ...],
  "track_a_recommended": "<skill id>",
  "track_b_recommended": "<skill id>"
}
```

If a log file for today already exists at that path, overwrite it.

---

## Step 10 — Recommend tomorrow's focus

After updating the file, respond with:

1. A bulleted list of skills that received new evidence today.
2. Any newly mastered skills (if any).
3. **Tomorrow's recommended Track A focus** — the skill currently with the most
   evidence below 3 (closest to mastered), or the first not-started skill in
   order if none are in-progress.
4. **Tomorrow's recommended Track B focus** — same logic.

---

## Update format (StrReplace target)

When editing skill-tracker.canvas.tsx, target only the data arrays.

**To add evidence to a skill** (e.g. r08 with no prior evidence):

Old:
```
  sk("r08", "Nil & complex conditions",        "ActiveRecord"),
```

New:
```
  sk("r08", "Nil & complex conditions",        "ActiveRecord", [
    { desc: "Fixed nil company_id scope in PROJ-208", type: "gitlab", date: "Jun 8, 2026" },
  ]),
```

**To increment DAYS_ELAPSED**:

Old: `const DAYS_ELAPSED = 0;`
New: `const DAYS_ELAPSED = 1;`

**To prepend a RECENT_UPDATES entry**:

Old:
```
const RECENT_UPDATES: UpdateEntry[] = [
];
```

New:
```
const RECENT_UPDATES: UpdateEntry[] = [
  { date: "Jun 8, 2026", lang: "a", skillId: "r08", desc: "Fixed nil scope in PROJ-208", type: "gitlab" },
  { date: "Jun 8, 2026", lang: "b", skillId: "v01", desc: "Composition API ref/reactive session", type: "learning" },
];
```

---

## Notes

- **Three proofs rule**: Only add evidence when the user clearly demonstrates
  understanding — not just exposure. A 30-min focused learning block = 1 proof.
  A real ticket fix demonstrating the skill = 1 proof.
- **Don't double-count**: Check the existing `ev` array before adding more.
- **Keep evidence concise**: Descriptions should be ≤ 80 characters.
- **This skill drives tomorrow's schedule**: always end by recommending Track A
  and Track B topics for the next day.

---

## Skill ID Reference

**Customize this table to match your actual skill tracks.**
The example below uses Ruby on Rails (Track A) and Vue 3 (Track B).

### Track A — Ruby on Rails

| ID  | Skill                         | Triggers / keywords                                      |
|-----|-------------------------------|----------------------------------------------------------|
| r01 | Ruby syntax & idioms          | blocks, procs, lambdas, symbols, frozen_string           |
| r02 | Object-oriented Ruby          | class, module, mixin, inheritance, include, extend       |
| r03 | Enumerables & iterators       | map, select, reject, reduce, each_with_object, group_by  |
| r04 | Exception handling            | rescue, begin, ensure, raise, retry                      |
| r05 | Closures & metaprogramming    | define_method, send, respond_to?, method_missing         |
| r06 | Model basics & validations    | validates, callbacks, before_save, dirty tracking        |
| r07 | Querying & named scopes       | where, joins, includes, pluck, scope                     |
| r08 | Nil & complex conditions      | where(col: nil), where(col: [v, nil]), OR conditions     |
| r09 | Associations                  | belongs_to, has_many, :through, polymorphic, dependent   |
| r10 | Migrations & schema           | add_column, add_index, change_column, foreign_key        |
| r11 | Transactions & locking        | transaction, lock!, with_lock, optimistic locking        |
| r12 | Service objects (PORO)        | service object, call interface, single responsibility    |
| r13 | Rake tasks                    | rake task, namespace, desc, in_batches, dry run          |
| r14 | Background jobs (Sidekiq)     | Sidekiq, ActiveJob, perform_later, retry, queue          |
| r15 | Concerns & modules            | concern, ClassMethods, included, module                  |
| r16 | Decorators & presenters       | presenter, decorator, SimpleDelegator, Draper            |
| r17 | RSpec fundamentals            | describe, context, it, expect, let, subject, matchers    |
| r18 | Mocks & doubles               | double, instance_double, allow, receive, stub            |
| r19 | FactoryBot & test data        | factory_bot, FactoryBot, create, build, trait            |
| r20 | Advanced patterns             | shared_examples, shared_context, custom matcher          |
| r21 | Testing rake & service objs   | testing a rake task, testing a service object in RSpec   |
| r22 | Bulk operations               | find_each, in_batches, upsert_all, update_all, batch     |
| r23 | Safe deploy patterns          | zero-downtime migration, backward-compatible column      |
| r24 | Debugging & profiling         | pry, byebug, explain, query log, rack-mini-profiler      |

### Track B — Vue 3

| ID  | Skill                          | Triggers / keywords                                     |
|-----|--------------------------------|---------------------------------------------------------|
| v01 | Reactivity — ref & reactive    | ref(), reactive(), setup(), reactivity                  |
| v02 | computed & watch               | computed(), watch(), watchEffect(), side effects        |
| v03 | Lifecycle hooks                | onMounted, onUpdated, onUnmounted, onBeforeMount        |
| v04 | Template refs & defineExpose   | ref attribute, useTemplateRef(), defineExpose()         |
| v05 | Async setup & Suspense         | async setup, Suspense component, await in setup         |
| v06 | Props, emits & defineModel     | defineProps(), defineEmits(), defineModel(), v-model    |
| v07 | Slots                          | slot, named slot, scoped slot, v-slot                   |
| v08 | provide / inject               | provide(), inject(), dependency injection               |
| v09 | Dynamic components & KeepAlive | <component :is>, KeepAlive, dynamic import              |
| v10 | Composables (useXxx)           | composable, useXxx, custom hook pattern, reuse          |
| v11 | Pinia — defineStore basics     | defineStore, state, getters, actions, Pinia             |
| v12 | storeToRefs & composition      | storeToRefs(), store composition, cross-store           |
| v13 | Async actions & state shapes   | async action, loading state, error state, try/catch     |
| v14 | Persisting store state         | pinia-plugin-persistedstate, localStorage, hydration    |
| v15 | Vue Router setup & routes      | createRouter, routes array, router-view, router-link    |
| v16 | Params, guards & meta          | route.params, beforeEach, navigation guard, meta        |
| v17 | Programmatic nav & lazy routes | router.push(), import(), lazy route, dynamic import     |
| v18 | TypeScript with Vue 3          | defineProps<T>, typed emits, typed store, generic       |
| v19 | Vite & project structure       | vite.config, env variables, import.meta.env, aliasing  |
| v20 | Custom directives & plugins    | createApp().directive(), install(), plugin, v-xxx       |
| v21 | Transitions & animations       | <Transition>, <TransitionGroup>, enter-from, leave-to  |
| v22 | Vitest & @vue/test-utils       | Vitest, mountComponent, wrapper, test(), describe()     |
| v23 | Testing composables & stores   | testing a composable, testing a Pinia store, vi.mock()  |
| v24 | Integration tests              | userEvent, fireEvent, flushPromises, component test     |
