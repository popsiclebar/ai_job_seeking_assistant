#!/bin/zsh
# Checks a one-page HTML resume or cover letter in headless Chrome and optionally exports it.
# Reports the whitespace above the first and below the last text line, plus page overflow, so
# margins can be verified numerically before a PDF is sent to an employer.
#
# Usage: check_resume.sh <page.html> [output.pdf] [preview.png]

set -euo pipefail
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
src="${1:?usage: check_resume.sh <page.html> [output.pdf] [preview.png]}"
pdf="${2:-}"
png="${3:-}"
src="$(cd "$(dirname "$src")" && pwd)/$(basename "$src")"

# Run Chrome with a hard timeout because headless Chrome occasionally hangs on macOS.
chrome() { perl -e 'alarm 30; exec @ARGV' "$CHROME" --headless=new --disable-gpu "$@" 2>/dev/null; }

# Inject a measuring script into a temporary sibling copy so relative assets still resolve.
tmp="$(dirname "$src")/.check_$(basename "$src")"
trap 'rm -f "$tmp"' EXIT
sed 's#</body>#<script>(()=>{const p=document.querySelector("main");const r=p.getBoundingClientRect();let t=1e9,b=0;const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(!n.textContent.trim())continue;const g=document.createRange();g.selectNodeContents(n);for(const x of g.getClientRects()){t=Math.min(t,x.top);b=Math.max(b,x.bottom);}}const i=v=>(v/96).toFixed(2);document.body.setAttribute("data-check",`top=${i(t-r.top)}in bottom=${i(r.bottom-b)}in overflow=${p.scrollHeight>p.clientHeight+1}`);})();</script></body>#' "$src" > "$tmp"

result=$(chrome --window-size=1000,1200 --virtual-time-budget=2000 --dump-dom "file://$tmp" | grep -o 'data-check="[^"]*"' | cut -d'"' -f2)
echo "$(basename "$src"): ${result:-measurement failed}"

[[ -n "$pdf" ]] && chrome --no-pdf-header-footer --print-to-pdf="$pdf" "file://$src" && echo "pdf: $pdf"
[[ -n "$png" ]] && chrome --hide-scrollbars --window-size=900,1110 --screenshot="$png" "file://$src" && echo "preview: $png"
exit 0
