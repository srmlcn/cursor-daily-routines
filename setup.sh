#!/usr/bin/env bash
# Run this once after cloning/copying to finish setup.
set -e

REPO="$(cd "$(dirname "$0")" && pwd)"

echo "→ Initializing git repo..."
git -C "$REPO" init
git -C "$REPO" add -A
git -C "$REPO" commit -m "Initial commit — generic daily briefing and debriefing skills"

echo ""
echo "→ Building canvas templates (requires Node.js)..."
cd "$REPO" && npm install && npm run build
echo "✓ Canvas templates built in dist/"

echo ""
echo "✓ Done! Next steps:"
echo "  1. cp $REPO/config.example.yml ~/.cursor/skills/config.yml"
echo "     Edit it with your name, timezone, MCP servers, and canvases_dir."
echo ""
echo "  2. cp -r $REPO/daily-briefing ~/.cursor/skills/"
echo "     cp -r $REPO/daily-debrief  ~/.cursor/skills/"
echo ""
echo "  3. Copy the canvas template into your Cursor workspace:"
echo "     cp $REPO/canvases/skill-tracker.template.canvas.tsx \\"
echo "        ~/path/to/your-workspace/canvases/skill-tracker.canvas.tsx"
echo ""
echo "  4. Say \"start my day\" in Cursor to generate your first briefing."
