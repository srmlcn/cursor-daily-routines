#!/usr/bin/env bash
# Run this once after cloning/copying to finish setup.
set -e

REPO="$(cd "$(dirname "$0")" && pwd)"

echo "→ Initializing git repo..."
git -C "$REPO" init
git -C "$REPO" add -A
git -C "$REPO" commit -m "Initial commit — generic daily briefing and debriefing skills"

echo ""
echo "✓ Done! Next steps:"
echo "  1. cp $REPO/config.example.yml ~/.cursor/skills/config.yml"
echo "     Edit it with your name, timezone, MCP servers, and canvases_dir."
echo ""
echo "  2. cp -r $REPO/daily-briefing ~/.cursor/skills/"
echo "     cp -r $REPO/daily-debrief  ~/.cursor/skills/"
echo ""
echo "  3. Create your canvas store and copy the skill tracker template:"
echo "     mkdir -p ~/.cursor/daily-routines/canvases"
echo "     cp $REPO/dist/skill-tracker.template.canvas.tsx \\"
echo "        ~/.cursor/daily-routines/canvases/skill-tracker.canvas.tsx"
echo ""
echo "  4. Say \"start my day\" in Cursor to generate your first briefing."
