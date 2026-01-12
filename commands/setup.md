---
name: setup
description: Configure claude-delegator with GPT (Codex) and Gemini CLI
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion
timeout: 120000
---

# Setup

Configure multi-provider expert subagents: GPT (Codex CLI), Gemini (CLI), and Claude (direct).

## Step 1: Check Codex CLI

```bash
which codex 2>/dev/null && codex --version 2>&1 | head -1 || echo "CODEX_MISSING"
```

### If Missing

Tell user:
```
Codex CLI not found.

Install with: npm install -g @openai/codex
Then authenticate: codex login

After installation, re-run /claude-delegator:setup
```

**Note: Continue to Step 2 even if Codex is missing (Gemini can work independently).**

## Step 2: Check Gemini CLI

```bash
which gemini 2>/dev/null && gemini --version 2>&1 | head -1 || echo "GEMINI_MISSING"
```

### If Missing

Tell user:
```
Gemini CLI not found.

Install with: npm install -g @google/gemini-cli
Then authenticate: gemini auth login

After installation, re-run /claude-delegator:setup
```

**Note: Continue even if Gemini is missing (GPT can work independently).**

## Step 3: Check Gemini MCP Server Build

```bash
ls ${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server/dist/index.js 2>/dev/null || echo "GEMINI_NOT_BUILT"
```

### If Not Built

```bash
cd ${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server && npm install && npm run build
```

## Step 4: Read Current Settings

```bash
cat ~/.claude/settings.json 2>/dev/null || echo "{}"
```

## Step 5: Configure MCP Servers

Merge into `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["-m", "gpt-5.2-codex", "mcp-server"]
    },
    "gemini": {
      "type": "stdio",
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server/dist/index.js"]
    }
  }
}
```

**CRITICAL**:
- Replace `${CLAUDE_PLUGIN_ROOT}` with actual plugin path
- Merge with existing settings, don't overwrite
- Preserve any existing `mcpServers` entries

## Step 6: Install Orchestration Rules

```bash
mkdir -p ~/.claude/rules/delegator && cp ${CLAUDE_PLUGIN_ROOT}/rules/*.md ~/.claude/rules/delegator/
```

## Step 7: Verify Installation

Run these checks and report results:

```bash
# Check 1: Codex CLI version
codex --version 2>&1 | head -1 || echo "Not installed"

# Check 2: Gemini CLI version
gemini --version 2>&1 | head -1 || echo "Not installed"

# Check 3: Codex MCP configured
cat ~/.claude/settings.json | jq -r '.mcpServers.codex.command // "Not configured"' 2>/dev/null

# Check 4: Gemini MCP configured
cat ~/.claude/settings.json | jq -r '.mcpServers.gemini.command // "Not configured"' 2>/dev/null

# Check 5: Gemini server built
ls ${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server/dist/index.js 2>/dev/null && echo "Built" || echo "Not built"

# Check 6: Rules installed (count files)
ls ~/.claude/rules/delegator/*.md 2>/dev/null | wc -l

# Check 7: Codex auth status
codex login status 2>&1 | head -1 || echo "Not authenticated"

# Check 8: Gemini auth status
gemini auth status 2>&1 | head -1 || echo "Not authenticated"
```

## Step 8: Report Status

Display actual values from the checks above:

```
claude-delegator Status (Multi-Provider)
═══════════════════════════════════════════════════════════════

GPT (Codex CLI)
───────────────────────────────────────────────────────────────
  CLI:         [✓/✗] [version or "Not installed"]
  MCP Config:  [✓/✗] codex mcp-server
  Auth:        [✓/✗] [status - run `codex login` if needed]

Gemini (CLI)
───────────────────────────────────────────────────────────────
  CLI:         [✓/✗] [version or "Not installed"]
  MCP Server:  [✓/✗] [Built or "Not built"]
  MCP Config:  [✓/✗] gemini-server
  Auth:        [✓/✗] [status - run `gemini auth login` if needed]

Claude (Direct)
───────────────────────────────────────────────────────────────
  Status:      ✓ Always available (no setup needed)

Rules
───────────────────────────────────────────────────────────────
  Installed:   [✓/✗] [N] files in ~/.claude/rules/delegator/

═══════════════════════════════════════════════════════════════
```

If any check fails, report the specific issue and how to fix it.

## Step 9: Final Instructions

```
Setup complete!

Authentication commands (run in terminal):
• GPT:    codex login
• Gemini: gemini auth login

Restart Claude Code to load MCP servers.

Seven experts across three providers:

┌─────────────────────────────────────────────────────────────────────────┐
│ GPT (Codex) - Architecture & Security                                   │
├──────────────────┬──────────────────────────────────────────────────────┤
│ Architect        │ "How should I structure this service?"               │
│                  │ → System design, tradeoffs, complex debugging        │
├──────────────────┼──────────────────────────────────────────────────────┤
│ Security Analyst │ "Is this authentication flow secure?"                │
│                  │ → Vulnerabilities, threat modeling, hardening        │
├─────────────────────────────────────────────────────────────────────────┤
│ Gemini - UI/UX & Frontend                                               │
├──────────────────┬──────────────────────────────────────────────────────┤
│ UI/UX Designer   │ "Review this design" (supports screenshots!)         │
│                  │ → Design systems, accessibility, visual review       │
├──────────────────┼──────────────────────────────────────────────────────┤
│ Frontend         │ "Optimize this React component"                      │
│ Specialist       │ → Performance, state management, CSS architecture    │
├─────────────────────────────────────────────────────────────────────────┤
│ Claude (Direct) - Code Quality & Planning                               │
├──────────────────┬──────────────────────────────────────────────────────┤
│ Code Reviewer    │ "Review this PR"                                     │
│                  │ → Code quality, bugs, maintainability                │
├──────────────────┼──────────────────────────────────────────────────────┤
│ Plan Reviewer    │ "Review this migration plan"                         │
│                  │ → Plan validation before execution                   │
├──────────────────┼──────────────────────────────────────────────────────┤
│ Scope Analyst    │ "Clarify the scope of this feature"                  │
│                  │ → Pre-planning, catches ambiguities                  │
└──────────────────┴──────────────────────────────────────────────────────┘

Provider is auto-detected based on task type.
Explicit: "GPT로 아키텍처 분석해줘" or "Gemini로 디자인 리뷰해줘"
```

## Step 10: Ask About Starring

Use AskUserQuestion to ask the user if they'd like to star the repository on GitHub to support the project.

Options: "Yes, star the repo" / "No thanks"

**If yes**: Check if `gh` CLI is available and run:
```bash
gh api -X PUT /user/starred/kimyoungwopo/claude-delegator
```

If `gh` is not available or the command fails, provide the manual link:
```
https://github.com/kimyoungwopo/claude-delegator
```

**If no**: Thank them and complete setup without starring.
