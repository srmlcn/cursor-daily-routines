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
echo ""
echo "  1. Install as a local Cursor plugin (symlinks are not supported):"
echo "     Clone or move this repo to ~/.cursor/plugins/local/cursor-daily-routines"
echo "     Example:"
echo "       git clone https://github.com/srmlcn/cursor-daily-routines.git \\"
echo "         ~/.cursor/plugins/local/cursor-daily-routines"
echo "     Or if you already cloned elsewhere:"
echo "       mv /path/to/cursor-daily-routines ~/.cursor/plugins/local/cursor-daily-routines"
echo ""
echo "  2. cp $REPO/config.example.yml ~/.cursor/skills/config.yml"
echo "     Edit it with your name, timezone, MCP servers, and canvases_dir."
echo ""
echo "  3. Create your canvas store and copy the skill tracker template:"
echo "     mkdir -p ~/.cursor/daily-routines/canvases"
echo "     cp $REPO/dist/skill-tracker.template.canvas.tsx \\"
echo "        ~/.cursor/daily-routines/canvases/skill-tracker.canvas.tsx"
echo ""
echo "  4. Reload Cursor (Developer: Reload Window)."
echo "  5. Say \"start my day\" in Cursor to generate your first briefing."
