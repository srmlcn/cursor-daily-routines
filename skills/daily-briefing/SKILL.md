---
name: daily-briefing
description: >-
  Generate a daily day-briefing canvas by fetching unread emails and open
  GitLab tickets, then building an 8-hour swimlane schedule. Use when asked
  for a daily briefing, morning plan, day schedule, or "start my day".
  Output goes to canvases_dir in ~/.cursor/skills/config.yml (not a Cursor workspace canvases folder).
---

# Daily Briefing Canvas

Generates `<day>-<month>-<year>-daily-routine.canvas.tsx` in your configured `canvases_dir` (e.g. `9-June-2026-daily-routine.canvas.tsx`).

---

## Step 0 — Load personal config

Read `~/.cursor/skills/config.yml`.

Extract and use throughout:
- `name`                  → PERSON_NAME
- `company`               → COMPANY
- `timezone`              → your local timezone label (e.g. "EST")
- `company_timezone`      → company timezone label (e.g. "PST")
- `timezone_offset_hours` → offset to show in subtitle (e.g. "+3")
- `default_start_time`    → default 24h start time
- `work_hours`            → working hours per day (excluding lunch)
- `lunch_duration_mins`   → lunch break length in minutes
- `email_mcp_server`      → MCP server name for email (null = skip Step 2)
- `gitlab_mcp_server`     → MCP server name for GitLab (null = skip Step 3)
- `track_a`               → skill track A config (name, short, lane_label)
- `track_b`               → skill track B config (name, short, lane_label)
- `skill_goal_start/end/days` → skill goal dates
- `canvases_dir`          → absolute path to the long-term canvas store (e.g. `~/.cursor/daily-routines/canvases`)

---

## Step 1 — Confirm today's start time

Ask the user if today's start differs from the default (`default_start_time` from config). If they don't specify, use the config default. Compute the end time:

```
end_time = start_time + work_hours + lunch_duration_mins
```

Example: start 10:30, 8h work, 30m lunch → end 19:15
(10:30–13:00 work, 13:00–13:30 lunch, 13:30–19:00 work, …)

---

## Step 2 — Fetch unread emails

If `email_mcp_server` is null, skip this step (leave EMAIL_THREADS as an empty array).

Use the MCP server named in `email_mcp_server`:

```
list_messages(folder="INBOX", unread=true, limit=20)
```

For each message that looks like it needs attention (not automated CI/bot notifications):

```
read_message(id=<message_id>)
```

**Build EMAIL_THREADS** — include only threads needing a human response or awareness.
Typically 1–3 items. Skip automated notifications unless they signal a blocker.

Each entry:
```typescript
{
  subject: string,
  participants: string[],   // key people in the thread
  summary: string,          // 2–3 sentences of what happened
  action: string,           // what the user should do (or "No action needed")
}
```

---

## Step 3 — Fetch open GitLab tickets and MRs

If `gitlab_mcp_server` is null, skip this step (leave TICKETS as an empty array).

Use the MCP server named in `gitlab_mcp_server`:

```
list_my_issues(state="opened")
list_my_merge_requests(state="opened")
```

For each open MR, fetch pipeline details:
```
get_issue_details(issue_id=<id>)   // for issues needing context
```

**Build TICKETS** — include the 2–4 most relevant open items. Prioritize:
1. MRs with failing pipelines or open review threads (hot)
2. Issues actively in progress (normal)

Each entry:
```typescript
{
  id: string,                // e.g. "PROJ-208"
  title: string,
  mr: string | null,         // e.g. "!7002"
  mrBadge: string | null,    // "Approved", "Changes requested", etc.
  pipelineBadge: string | null, // "Failing", "Passing", null
  context: string,           // 1-2 sentence description of state
  failing: string[],         // failing CI job names (empty if none)
  thread: string,            // open review comment or next action
}
```

---

## Step 4 — Read skill tracker for today's focus

Read `skill-tracker.canvas.tsx` from `canvases_dir`.

For each track (TRACK_A / TRACK_B), find **nextFocus**:
- If any skill has `ev.length > 0` and `ev.length < 3`, pick the one with the **most evidence** (closest to mastered).
- Otherwise pick the first skill where `ev.length === 0`.

Use these two skill names as the `sublabel` of the corresponding track A / track B schedule blocks.

---

## Step 5 — Build the schedule

### Rules

1. **First block**: 15-min Ramp-up (type: `ramp`) — always starts at `start_time`
2. **Insert meetings** at the time the user specified; keep them 10–15 min
3. **Lunch**: `lunch_duration_mins` (type: `lunch`) — place ~1.5–2h after start
4. **Breaks**: 10 min (type: `break`) every ~75–90 min of work
5. **Ticket blocks** (type: `ticket`): 30–45 min each; label as the ticket ID
6. **Skill dev blocks**: 30 min each; alternate track A / track B
   - Track A: type `skill-a`, label = `track_a.short` from config
   - Track B: type `skill-b`, label = `track_b.short` from config
7. **EOD**: 10–15 min (type: `ramp`) — always ends the day
8. All times in 24h `"HH:MM"` format

### Block type color mapping
| type      | lane              | color  |
|-----------|-------------------|--------|
| ticket    | Tickets           | blue   |
| skill-a   | Track A lane      | orange |
| skill-b   | Track B lane      | green  |
| break / lunch / meeting / ramp | Other | gray |

### BLOCK_DETAILS — one entry per BLOCK (same index)

```typescript
{
  tag: string,          // short label: ticket ID, track short name, "Break", "Lunch", etc.
  heading: string,      // full panel heading (10–12 words)
  description: string,  // 1–2 sentence context for this specific block
  bullets: string[],    // 3–6 specific action items
  note?: string,        // optional italic footnote
}
```

Write tight, actionable bullets — not generic advice. Reference specific file paths, method names, and ticket IDs when known.

---

## Step 6 — Populate the template and write the canvas

1. Read `dist/briefing.template.canvas.tsx` from the plugin root (the pre-built, self-contained version with all components inlined — no relative imports)
2. Replace the `/* ══ FILL DAILY ══ */` data section at the top with real data:
   - `DATE_LABEL`, `START_NOTE`, `PERSON_NAME` (from config `name`), `COMPANY` (from config `company`)
   - `TIMEZONE_LABEL` → `"{timezone} ({company_timezone} +{timezone_offset_hours}h)"` e.g. `"EST (PST +3h)"`
   - `EMAIL_THREADS[]`
   - `TICKETS[]`
   - `BLOCKS[]` (all 24h times; use block types `skill-a` / `skill-b`)
   - `BLOCK_DETAILS[]` (same length and order as BLOCKS)
   - `DAY_START`, `DAY_END`, `DAY_TOTAL` (derived from start/end times)
   - `TRACK_A_NAME` → `track_a.name` from config
   - `TRACK_A_LANE` → `track_a.lane_label` from config
   - `TRACK_B_NAME` → `track_b.name` from config
   - `TRACK_B_LANE` → `track_b.lane_label` from config
3. **Sync skill data**: read `skill-tracker.canvas.tsx` and copy the current `TRACK_A[]`, `TRACK_B[]`, `SK_RECENT[]`, and `SK_DAYS_ELAPSED` values into the same-named constants in the template.
4. Leave all visual components (`Swimlane`, `BlockDescription`, `BalanceStats`, `SkOverviewCard`, etc.) untouched.
5. Build today's canvas filename: `<day>-<month>-<year>-daily-routine.canvas.tsx`
   - Day number without a leading zero (e.g. `9`, not `09`)
   - Full month name, not abbreviated (e.g. `June`, not `Jun`)
   - Example: `9-June-2026-daily-routine.canvas.tsx`
6. Create `canvases_dir` if it does not exist.
7. Write the result to `{canvases_dir}/<day>-<month>-<year>-daily-routine.canvas.tsx`.

---

## Checklist before writing the file

- [ ] BLOCKS and BLOCK_DETAILS have the same length
- [ ] All times are 24h `"HH:MM"` and sequential (no gaps or overlaps)
- [ ] DAY_START = toMins(BLOCKS[0].start), DAY_END = toMins(BLOCKS[last].end)
- [ ] DAY_TOTAL = DAY_END - DAY_START
- [ ] Lunch block has type `"lunch"` (excluded from balance stats)
- [ ] At least one `ramp` block at start and end
- [ ] Ticket/skill balance is roughly 50/50 (by minute count)
- [ ] No hardcoded hex colors — all colors use `theme.category.*` or `theme.text.*`

---

## Step 7 — Write the daily log entry

After writing the canvas, append a JSON log file to `logs_dir` from config.

**File path:** `{logs_dir}/YYYY-MM-DD-briefing.json`  
(Use today's date. Create the directory if it does not exist.)

**Schema:**

```json
{
  "date": "YYYY-MM-DD",
  "start_time": "HH:MM",
  "end_time": "HH:MM",
  "block_count": <number of BLOCKS>,
  "ticket_ids": ["<id>", ...],
  "email_thread_count": <number of EMAIL_THREADS>,
  "track_a_focus": "<skill name used as sublabel for track A block, or null>",
  "track_b_focus": "<skill name used as sublabel for track B block, or null>",
  "canvas_path": "<absolute path of the written canvas file>"
}
```

If a log file for today already exists at that path, overwrite it.
