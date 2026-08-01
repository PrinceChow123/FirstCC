# Codex Agent Collaboration Guide — Design Specification

## Purpose

Create a single-file Chinese HTML reference for the repository owner. The guide must consolidate the preceding discussion about Codex sessions, subagents, context isolation, configuration inheritance, cross-workspace collaboration, and the recommended pattern where Agent B directs an independent Agent A through Codex MCP.

The finished page is a personal engineering manual rather than a marketing page. It must support both linear reading and fast return visits for copying configuration or checking architectural boundaries.

## Deliverable

- Final file: `docs/codex-agent-collaboration.html`
- Format: standalone HTML with embedded CSS and JavaScript
- Runtime dependencies: none
- Primary language: Simplified Chinese
- External links: official Codex documentation only
- Existing repository pages and navigation remain unchanged

## Audience and Use Cases

The sole primary audience is the repository owner. The page must help with four recurring tasks:

1. Recall the difference between an agent role, a session/thread, a subagent, a workspace, and `CODEX_HOME`.
2. Check what a normal subagent inherits and what it does not inherit.
3. Recreate the architecture in which Agent B manages Agent A without flattening A into B's configuration.
4. Copy the MCP, `AGENTS.md`, task-handoff, and acceptance-checklist examples into a real setup.

## Chosen Direction

The approved direction is **A: Architecture Atlas**.

The page uses a dark engineering-manual visual system with a persistent chapter rail on desktop and a compact chapter navigator on mobile. Diagrams, matrices, and configuration blocks carry the explanation. The page retains a narrative reading path so a first-time reader can move from concepts to implementation without jumping around.

## Information Architecture

The final page contains ten chapters in this order:

1. **Quick conclusion** — the recommended pattern in one sentence: do not copy Agent A; call an independent A environment.
2. **Agent and session** — distinguish role configuration from a persisted conversation thread.
3. **Subagent context** — explain independent thread/context windows, selective context transfer, sibling isolation, and shared project files.
4. **Configuration inheritance boundary** — show the inheritance and isolation behavior for instructions, model, sandbox, skills, MCP, memory, workspace, and session history.
5. **Cross-workspace collaboration** — compare a shared parent workspace, separate sessions with manual relay, and an automated coordinator.
6. **Agent B directs Agent A** — present the recommended supervisor/executor architecture and task lifecycle.
7. **MCP configuration** — provide a copyable `config.toml` example using `codex mcp-server`, A's `cwd`, and optionally A's dedicated `CODEX_HOME`.
8. **Thread continuity** — explain initial `codex` calls, returned `threadId`, subsequent `codex-reply` calls, and the difference between durable configuration/memory and an old transcript.
9. **Handoff and acceptance** — provide task-contract, result-contract, bounded-rework, and integration templates.
10. **Safety checklist** — cover permissions, credentials, write conflicts, shared-memory misconceptions, trust boundaries, timeouts, and verification.

## Core Architecture Diagram

The principal diagram must show:

```text
Agent B (supervisor)
  -> Agent A MCP server
      -> independent Codex process
          -> cwd = workspace-A
          -> CODEX_HOME = codex-home-A
          -> project AGENTS.md and .codex/config.toml
          -> A skills and MCP servers
          -> A memory store
          -> A thread identified by threadId
```

The task flow must be visible as a closed loop:

```text
B decomposes task
  -> codex(prompt, cwd=A)
  -> A executes and returns content + threadId
  -> B validates
  -> codex-reply(threadId, feedback) when needed
  -> B integrates accepted output
```

The diagram must visually distinguish:

- control flow from B to A;
- result flow from A to B;
- persistent environment identity (`cwd`, `CODEX_HOME`);
- conversation continuity (`threadId`).

## Inheritance Matrix

The matrix must avoid blanket claims and use these categories:

- inherited from parent unless overridden;
- configured by the child role;
- shared runtime resource;
- separate thread state;
- not independently namespaced by default;
- isolated only through a separate Codex process or `CODEX_HOME`.

It must explicitly communicate:

- A normal subagent has an independent agent thread/context window.
- A normal subagent does not automatically load another workspace's project configuration merely because it is named after that agent.
- Project instructions and project skills depend on the effective working directory and trusted project configuration.
- Local memories are stored under `CODEX_HOME`; different workspaces alone do not create separate memory stores.
- An existing session transcript is distinct from skills, project configuration, and generated memories.
- Multiple agents writing the same checkout can conflict even when their conversation contexts are separate.

## Configuration Examples

The page must include copyable examples for:

1. B's `.codex/config.toml` entry for the `agent_a` MCP server.
2. A variant that supplies A's dedicated `CODEX_HOME` through the MCP server environment.
3. B's `AGENTS.md` supervisor instructions.
4. The first task sent through `codex` with `cwd`, `sandbox`, and `approval-policy`.
5. A follow-up request through `codex-reply` with `threadId`.
6. A structured handoff response containing status, deliverables, verification, blockers, and next action.

Examples must use obvious placeholder paths such as `/absolute/path/to/workspace-A`; they must not contain real credentials, tokens, QR codes, or machine-specific secrets.

## Visual System

### Color

- Page background: near-black navy
- Primary surface: deep blue-black
- Border: muted slate blue
- Main text: cool off-white
- Secondary text: desaturated blue-gray
- Agent B/control accent: electric blue
- Agent A/execution accent: teal
- Warning accent: restrained amber
- Error/prohibition accent: restrained coral

Color must reinforce meaning consistently; it is not decorative.

### Typography

- UI and prose: system sans-serif stack with Chinese-first fallbacks
- Code and identifiers: system monospace stack
- Large title: compact line height and strong weight
- Body: comfortable reading width and at least 1.7 line height
- Small labels: uppercase or spaced technical labels only where they clarify structure

### Layout

- Desktop: fixed-width chapter rail plus a centered reading canvas
- Wide diagrams: allowed to use the full reading canvas width
- Prose: constrained measure for readability
- Code: full-width copyable blocks with wrapping or horizontal scrolling as appropriate
- Mobile: single column, horizontal/expandable chapter navigation, no fixed sidebar

The design must avoid repetitive card grids. Cards are reserved for quick conclusions, comparisons, and checklists; normal exposition remains open and continuous.

## Interaction

The standalone page includes only useful local interactions:

- active-section highlighting as the reader scrolls;
- chapter navigation with anchor links;
- one-click copy buttons on configuration and prompt blocks;
- collapsible detail sections only for supplementary explanations;
- a back-to-top control after substantial scrolling;
- visible keyboard focus states;
- reduced-motion support.

No analytics, network requests, persistent tracking, framework runtime, or decorative interaction is permitted.

## Responsive and Accessibility Requirements

- Verify at desktop width around 1440 px and mobile width around 390 px.
- No horizontal page overflow at mobile width.
- Code blocks may scroll horizontally without forcing the page wider.
- All diagrams remain understandable when stacked vertically.
- Minimum body text size is 16 px on mobile.
- Semantic heading order is preserved.
- Navigation has an accessible label.
- Copy controls expose meaningful labels and status feedback.
- Accent colors maintain readable contrast against their surfaces.
- Motion respects `prefers-reduced-motion`.

## Content Accuracy Boundaries

The guide must distinguish documented Codex behavior from recommended workflow design. It must not imply:

- that two existing sessions can be connected with a slash command;
- that naming a child Agent A loads workspace A;
- that separate workspaces automatically create separate memory stores;
- that `threadId` replaces `cwd` or `CODEX_HOME`;
- that `approval-policy = "never"` grants additional permissions;
- that shared filesystem access means shared conversation context.

The references section must link to the official Codex pages for Subagents, MCP Server, Memories, Worktrees, CLI commands, and configuration/state locations.

## Validation

Before publication:

1. Parse or lint the HTML using an available local tool.
2. Serve the page locally over HTTP.
3. Inspect the complete page in a browser at desktop and mobile widths.
4. Exercise chapter navigation, copy buttons, collapsible content, and back-to-top behavior.
5. Capture screenshots for visual review.
6. Check for clipped text, accidental wrapping, horizontal overflow, unreadable code, and broken anchors.
7. Verify that every command and configuration block matches the approved architecture.
8. Confirm no credentials or machine-specific secrets appear in the file.

## Publication

- Work on branch `agent/codex-agent-collaboration-guide`.
- Commit the design specification separately before implementation.
- Commit the HTML implementation after browser validation.
- Push the branch to `PrinceChow123/FirstCC`.
- Open a draft pull request against the repository default branch.
