# Codex Agent Collaboration Guide Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a standalone Chinese HTML engineering manual about Codex subagent context, configuration boundaries, and Agent B supervising an independent Agent A through MCP.

**Architecture:** One semantic HTML file owns the content, CSS diagrams, visual system, and dependency-free interactions. A sticky desktop chapter rail becomes compact mobile navigation below 860 px. The page makes no network requests and links only to official Codex documentation.

**Tech Stack:** HTML5, embedded CSS, embedded vanilla JavaScript, `xmllint`, Node smoke checks, browser responsive inspection, Git, GitHub CLI.

## Global Constraints

- Create exactly `docs/codex-agent-collaboration.html`; do not modify existing pages.
- Use Simplified Chinese and the approved ten-chapter order.
- Use near-black navy, cool off-white, Agent B blue, Agent A teal, warning amber, and prohibition coral.
- Include copyable MCP, `AGENTS.md`, initial request, `codex-reply`, and handoff examples.
- Do not include credentials, tokens, QR material, analytics, remote assets, frameworks, or runtime dependencies.
- Verify at approximately 1440 px desktop and 390 px mobile widths.
- Keep mobile body text at least 16 px and prevent horizontal page overflow.
- Respect `prefers-reduced-motion` and visible keyboard focus.
- Label documented behavior separately from recommended workflow design.

---

## File Structure

- Create `docs/codex-agent-collaboration.html`: complete content, CSS, diagrams, and interactions.
- Reference `docs/superpowers/specs/2026-08-01-codex-agent-collaboration-guide-design.md`: approved requirements.
- Leave `docs/index.html`, Electron sources, manifests, and existing presentations untouched.

### Task 1: Semantic Content and Ten-Chapter Reading Path

**Files:**
- Create: `docs/codex-agent-collaboration.html`
- Reference: `docs/superpowers/specs/2026-08-01-codex-agent-collaboration-guide-design.md`

**Interfaces:**
- Produces section IDs: `quick-conclusion`, `agent-session`, `subagent-context`, `inheritance`, `cross-workspace`, `b-directs-a`, `mcp-config`, `thread-continuity`, `handoff`, `safety`.
- Produces `.chapter-link[href="#<section-id>"]` navigation links.
- Produces `.copy-block` elements containing one nested `<code>` element each.

- [ ] **Step 1: Run the pre-implementation check**

```bash
node -e 'const fs=require("fs"); const p="docs/codex-agent-collaboration.html"; if(!fs.existsSync(p)) throw new Error("guide missing")'
```

Expected: non-zero exit with `guide missing`.

- [ ] **Step 2: Create the semantic document shell**

Use this skeleton and preserve every ID:

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Codex Agent Atlas — 子 Agent 与跨工作区协作</title>
</head>
<body>
  <a class="skip-link" href="#main-content">跳到正文</a>
  <aside class="chapter-rail" aria-label="章节导航"><nav><!-- ten links --></nav></aside>
  <main id="main-content">
    <section id="quick-conclusion"></section>
    <section id="agent-session"></section>
    <section id="subagent-context"></section>
    <section id="inheritance"></section>
    <section id="cross-workspace"></section>
    <section id="b-directs-a"></section>
    <section id="mcp-config"></section>
    <section id="thread-continuity"></section>
    <section id="handoff"></section>
    <section id="safety"></section>
  </main>
</body>
</html>
```

- [ ] **Step 3: Write the complete Chinese content**

Include these exact conclusions with surrounding explanation:

```text
对话上下文独立，项目文件环境通常共享。
不要复制 Agent A，而要调用一个真正运行在 A 环境中的 Codex 实例。
cwd 决定项目上下文，CODEX_HOME 决定全局状态，threadId 决定会话续传。
```

The inheritance matrix must cover instructions, model/reasoning, sandbox/approvals, skills, MCP, memories, working directory, filesystem changes, and transcript history.

- [ ] **Step 4: Add the required copyable examples**

Use this exact safe MCP baseline:

```toml
[mcp_servers.agent_a]
command = "codex"
args = ["mcp-server"]
cwd = "/absolute/path/to/workspace-A"
env = { CODEX_HOME = "/absolute/path/to/codex-home-A" }
startup_timeout_sec = 20
tool_timeout_sec = 3600
required = true
```

Also include B supervisor instructions, an initial `codex` request, a `codex-reply` request, and an A result contract with status, deliverables, verification, blockers, and next action.

- [ ] **Step 5: Add official references**

```text
https://learn.chatgpt.com/docs/agent-configuration/subagents
https://learn.chatgpt.com/docs/mcp-server
https://learn.chatgpt.com/docs/customization/memories
https://learn.chatgpt.com/docs/environments/git-worktrees
https://learn.chatgpt.com/docs/developer-commands?surface=cli
https://learn.chatgpt.com/docs/config-file/config-advanced#config-and-state-locations
```

- [ ] **Step 6: Run the content contract**

```bash
node - <<'NODE'
const fs = require('fs');
const html = fs.readFileSync('docs/codex-agent-collaboration.html', 'utf8');
const ids = ['quick-conclusion','agent-session','subagent-context','inheritance','cross-workspace','b-directs-a','mcp-config','thread-continuity','handoff','safety'];
for (const id of ids) if (!html.includes(`id="${id}"`)) throw new Error(`missing ${id}`);
for (const text of ['CODEX_HOME','threadId','codex-reply','mcp_servers.agent_a']) if (!html.includes(text)) throw new Error(`missing ${text}`);
console.log('content contract passed');
NODE
```

Expected: `content contract passed`.

- [ ] **Step 7: Commit the content**

```bash
git add docs/codex-agent-collaboration.html
git commit -m "docs: add Codex agent collaboration guide"
```

### Task 2: Architecture Atlas Visual System

**Files:**
- Modify: `docs/codex-agent-collaboration.html`

**Interfaces:**
- Consumes the Task 1 anchors and semantic content.
- Produces CSS tokens `--bg`, `--surface`, `--border`, `--text`, `--muted`, `--agent-b`, `--agent-a`, `--warning`, and `--danger`.
- Produces `.chapter-rail`, `.reading-canvas`, `.architecture-flow`, `.inheritance-table`, `.code-panel`, and `.mobile-chapter-nav`.

- [ ] **Step 1: Add the approved tokens and typography**

```css
:root {
  color-scheme: dark;
  --bg: #080d1a;
  --surface: #0e172a;
  --surface-raised: #111d34;
  --border: #293754;
  --text: #e8eef8;
  --muted: #9aabc5;
  --agent-b: #6f8cff;
  --agent-a: #2dd4bf;
  --warning: #f2b84b;
  --danger: #f17a72;
  --sans: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  --mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}
```

- [ ] **Step 2: Implement the desktop atlas layout**

Use a 232 px sticky chapter rail and a reading canvas capped near 1080 px. Restrict normal prose to approximately 760 px. Allow matrices, diagrams, and code panels to span the canvas. Reserve bordered panels for conclusions, comparisons, code, and checklists.

- [ ] **Step 3: Build the core architecture diagram as semantic HTML**

```html
<div class="architecture-flow" aria-label="Agent B 通过 MCP 调用 Agent A">
  <div class="agent-node agent-node--b"><strong>Agent B</strong><span>主管·拆解·验收</span></div>
  <div class="flow-edge"><span>codex / codex-reply</span><span>content / threadId</span></div>
  <div class="bridge-node">Codex MCP</div>
  <div class="agent-node agent-node--a"><strong>Agent A</strong><span>专业执行者</span></div>
</div>
```

Add a second diagram for `cwd`, `CODEX_HOME`, and `threadId`, plus a numbered delegation-to-integration lifecycle.

- [ ] **Step 4: Implement mobile layout**

At `max-width: 860px`, hide the rail, show `.mobile-chapter-nav`, stack diagram nodes, keep body text at least 16 px, and set code panels to `overflow-x: auto`. At 520 px, reduce canvas padding while preserving 44 px interactive targets.

- [ ] **Step 5: Add focus, print, and reduced-motion styles**

```css
:focus-visible { outline: 3px solid var(--agent-a); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
@media print {
  .chapter-rail, .mobile-chapter-nav, .copy-button, .back-to-top { display: none !important; }
  body { background: #fff; color: #111; }
}
```

- [ ] **Step 6: Run visual static checks**

```bash
xmllint --html --noout docs/codex-agent-collaboration.html
node -e 'const h=require("fs").readFileSync("docs/codex-agent-collaboration.html","utf8"); for(const s of ["--agent-b","--agent-a","@media (max-width: 860px)","prefers-reduced-motion","architecture-flow"]) if(!h.includes(s)) throw new Error("missing "+s); console.log("visual contract passed")'
```

Expected: no fatal HTML error and `visual contract passed`.

- [ ] **Step 7: Commit the visual system**

```bash
git add docs/codex-agent-collaboration.html
git commit -m "style: build agent architecture atlas"
```

### Task 3: Navigation and Copy Controls

**Files:**
- Modify: `docs/codex-agent-collaboration.html`

**Interfaces:**
- Consumes `.chapter-link`, ten section IDs, and `.copy-block code`.
- Produces `copyText(button)`, `setActiveSection(sectionId)`, one `IntersectionObserver`, `.back-to-top`, and mobile navigation.

- [ ] **Step 1: Verify the interaction contract fails before implementation**

```bash
node -e 'const h=require("fs").readFileSync("docs/codex-agent-collaboration.html","utf8"); for(const s of ["function copyText","IntersectionObserver","aria-live","back-to-top"]) if(!h.includes(s)) throw new Error("missing "+s)'
```

Expected: non-zero exit.

- [ ] **Step 2: Add accessible copy controls**

```html
<button class="copy-button" type="button" aria-label="复制这段配置" onclick="copyText(this)">复制</button>
```

Implement `copyText(button)` with `navigator.clipboard.writeText`, a selection plus `document.execCommand('copy')` fallback, an `aria-live="polite"` status, and a 1.5-second `已复制` confirmation.

- [ ] **Step 3: Add scroll-spy**

Create one center-weighted `IntersectionObserver`. `setActiveSection(id)` sets `aria-current="location"` on matching desktop and mobile links and removes it from other chapter links.

- [ ] **Step 4: Add mobile navigation and back-to-top behavior**

Use native `<details class="mobile-chapter-nav">`. Show `.back-to-top` after `window.scrollY > 720`; use smooth scrolling unless reduced motion is requested.

- [ ] **Step 5: Run the interaction contract**

```bash
node -e 'const h=require("fs").readFileSync("docs/codex-agent-collaboration.html","utf8"); for(const s of ["function copyText","IntersectionObserver","aria-live","back-to-top","aria-current"]) if(!h.includes(s)) throw new Error("missing "+s); console.log("interaction contract passed")'
```

Expected: `interaction contract passed`.

- [ ] **Step 6: Commit interactions**

```bash
git add docs/codex-agent-collaboration.html
git commit -m "feat: add guide navigation and copy controls"
```

### Task 4: Browser QA and Accuracy Audit

**Files:**
- Modify if QA finds defects: `docs/codex-agent-collaboration.html`

**Interfaces:**
- Consumes the completed standalone page.
- Produces a validated desktop/mobile render and clean Git diff.

- [ ] **Step 1: Serve the repository locally**

```bash
python3 -m http.server 4173
```

Expected URL: `http://127.0.0.1:4173/docs/codex-agent-collaboration.html`.

- [ ] **Step 2: Inspect at approximately 1440 px**

Confirm the sticky rail, centered canvas, Agent B/MCP/Agent A diagram, ten sections, code panels, type hierarchy, and absence of clipped text or unintended overlays.

- [ ] **Step 3: Inspect at 390 px**

Confirm mobile navigation, stacked diagrams, 16 px body text, usable controls, scrolling code panels, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 4: Exercise the interaction path**

Activate chapter navigation, copy the MCP block, expand one details section, scroll until back-to-top appears, activate it, and verify visible keyboard focus.

- [ ] **Step 5: Run structural and secret audits**

```bash
xmllint --html --noout docs/codex-agent-collaboration.html
node - <<'NODE'
const fs = require('fs');
const h = fs.readFileSync('docs/codex-agent-collaboration.html', 'utf8');
const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
if (ids.length !== new Set(ids).size) throw new Error('duplicate id');
for (const link of [...h.matchAll(/href="#([^"]+)"/g)].map(m => m[1])) if (!ids.includes(link)) throw new Error(`broken anchor ${link}`);
for (const secret of [/gho_[A-Za-z0-9]+/, /sk-[A-Za-z0-9_-]{16,}/, /app_secret\s*=\s*["'][^"']+/i]) if (secret.test(h)) throw new Error(`possible secret ${secret}`);
console.log('document audit passed');
NODE
git diff --check
```

Expected: no fatal parse error, `document audit passed`, and silent `git diff --check`.

- [ ] **Step 6: Review and repair the final diff**

```bash
git diff --stat origin/main...HEAD
git diff -- docs/codex-agent-collaboration.html
git status --short --branch
```

Confirm no existing page changed and no `.superpowers/` artifact is staged.

- [ ] **Step 7: Commit QA fixes only when needed**

```bash
git add docs/codex-agent-collaboration.html
git commit -m "fix: polish agent guide responsive behavior"
```

Skip the commit if QA requires no file change.

### Task 5: Push and Open a Draft Pull Request

**Files:**
- No file changes expected.

**Interfaces:**
- Consumes validated branch `agent/codex-agent-collaboration-guide`.
- Produces a remote branch and draft PR into `main`.

- [ ] **Step 1: Confirm repository state**

```bash
git status --short --branch
git log --oneline origin/main..HEAD
git remote -v
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef
```

Expected: repository `PrinceChow123/FirstCC`, clean worktree, authenticated GitHub session, and default branch `main`.

- [ ] **Step 2: Push the branch**

```bash
git push -u origin agent/codex-agent-collaboration-guide
```

- [ ] **Step 3: Open the draft PR**

Use title `Add Codex agent collaboration guide`. The body summarizes the standalone guide, explains the MCP isolation decision, lists desktop/mobile and interaction validation, and states that existing pages were not modified.

- [ ] **Step 4: Verify publication**

```bash
gh pr view --json url,title,isDraft,headRefName,baseRefName
```

Expected: a draft PR from `agent/codex-agent-collaboration-guide` into `main` with a shareable URL.
