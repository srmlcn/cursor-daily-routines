# cursor-daily-routines

A shareable set of [Cursor Agent Skills](https://docs.cursor.com/agent/skills) for building a structured daily briefing and debriefing routine with skill-progress tracking.

---

## What's included

| File | Purpose |
|------|---------|
| `config.example.yml` | Personal settings — copy to `~/.cursor/skills/config.yml` and fill in |
| `daily-briefing/SKILL.md` | Morning skill: fetches emails + GitLab tickets, builds an 8-hour swimlane schedule |
| `daily-briefing/template.canvas.tsx` | Canvas template used each morning |
| `daily-debrief/SKILL.md` | EOD skill: processes your day synopsis and updates skill-mastery progress |
| `canvases/skill-tracker.template.canvas.tsx` | Skill tracker canvas starting template |

---

## How it works

```
Morning
  "start my day" ──▶ daily-briefing skill
                       reads config.yml
                       reads skill-tracker.canvas.tsx (for today's focus topics)
                       fetches unread emails (Zimbra / other)
                       fetches open GitLab tickets and MRs
                       builds 8-hour swimlane schedule
                       writes day-briefing.canvas.tsx ──▶ open in Cursor Canvas

Evening
  "end of day: ..." ──▶ daily-debrief skill
                          reads config.yml
                          parses your synopsis
                          maps work to skill IDs
                          appends evidence to skill-tracker.canvas.tsx
                          recommends tomorrow's focus topics
```

**Mastery rule**: a skill is mastered after **3 proofs** (GitLab fixes or focused learning sessions).

---

## Setup

### 1. Install the skills

Copy the two skill folders into your Cursor skills directory:

```bash
cp -r daily-briefing  ~/.cursor/skills/
cp -r daily-debrief   ~/.cursor/skills/
```

### 2. Configure your personal settings

```bash
cp config.example.yml ~/.cursor/skills/config.yml
```

Open `~/.cursor/skills/config.yml` and fill in:
- Your name and company
- Timezone info
- Your default start time
- Your MCP server names (Zimbra, GitLab — or `null` to skip)
- Your two skill tracks (see below)
- Your workspace's `canvases_dir` path

### 3. Set up your workspace canvases folder

Create a `canvases/` folder inside your Cursor workspace (or use an existing one):

```bash
mkdir -p ~/path/to/your-workspace/canvases
```

Copy the skill tracker template into it:

```bash
cp canvases/skill-tracker.template.canvas.tsx \
   ~/path/to/your-workspace/canvases/skill-tracker.canvas.tsx
```

Update `canvases_dir` in your `config.yml` to point to this folder.

### 4. Customize your skill tracks

The default skill tables use **Ruby on Rails** (Track A) and **Vue 3** (Track B).

If you're learning different technologies:

**Option A — Full replacement**: Edit `skill-tracker.canvas.tsx` and replace the `TRACK_A` and `TRACK_B` arrays with your own skills. Update the `Skill ID Reference` table in `daily-debrief/SKILL.md` to match.

**Option B — Quick rename**: If you just want to rename the tracks without changing the skill list, update `config.yml`:

```yaml
track_a:
  name: "Python"
  short: "Python"
  lane_label: "Python Dev"
track_b:
  name: "React"
  short: "React"
  lane_label: "React Dev"
```

Then update `TRACK_A_NAME`, `TRACK_B_NAME`, and `PERSON_NAME` at the top of `skill-tracker.canvas.tsx`.

### 5. Set up MCP integrations (optional)

The briefing skill can fetch your emails and GitLab tickets automatically if you have MCP servers configured.

**Zimbra (email)**:

Add to `~/.cursor/mcp.json`:
```json
"user-zimbra": {
  "command": "...",
  "args": ["..."]
}
```
Then set `email_mcp_server: "user-zimbra"` in your `config.yml`.

**GitLab**:

Add to `~/.cursor/mcp.json`:
```json
"user-gitlab": {
  "command": "...",
  "args": ["..."]
}
```
Then set `gitlab_mcp_server: "user-gitlab"` in your `config.yml`.

If you don't have these set up, set either value to `null` in `config.yml` — the skill will skip those steps gracefully and you can fill in your inbox and tickets manually.

---

## Daily usage

### Morning briefing

Say any of:
- "start my day"
- "daily briefing"
- "morning plan"

The skill confirms your start time, fetches context, and writes a new `day-briefing.canvas.tsx` to your canvases folder. Open it in Cursor Canvas.

### End-of-day debrief

Say any of:
- "end of day: ..."
- "daily debrief: ..."
- "here's what I did today: ..."

Follow it with a brief description of what you worked on. The skill maps your work to skill IDs, updates `skill-tracker.canvas.tsx`, and recommends tomorrow's focus topics.

---

## Customizing your skill list

Each skill needs a unique ID (e.g. `r01`, `v01`) and a category name. Categories are automatically grouped in the canvas.

Example — replacing the Ruby track with Python:

```typescript
const TRACK_A: TrackedSkill[] = [
  sk("p01", "Python syntax & idioms",      "Language Core"),
  sk("p02", "Classes & OOP",               "Language Core"),
  sk("p03", "List comprehensions",         "Language Core"),
  sk("p04", "Decorators",                  "Advanced"),
  sk("p05", "async/await",                 "Advanced"),
  sk("p06", "Django models",               "Django"),
  // ...
];
```

Then update the `Skill ID Reference` table in `daily-debrief/SKILL.md` with matching IDs and trigger keywords.

---

## File layout after setup

```
~/.cursor/
  skills/
    config.yml                         ← your personal settings
    daily-briefing/
      SKILL.md
      template.canvas.tsx
    daily-debrief/
      SKILL.md

~/your-workspace/
  canvases/
    skill-tracker.canvas.tsx           ← your live skill progress
    day-briefing.canvas.tsx            ← generated each morning
```

---

## Contributing

Pull requests welcome. If you adapt the skill tables for a different tech stack, consider opening a PR to add your skill list as an example under `examples/`.
