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

## Step 4: Check .mcp.json Configuration

Claude Code loads MCP servers from the `.mcp.json` file in the plugin root directory.

```bash
cat ${CLAUDE_PLUGIN_ROOT}/.mcp.json 2>/dev/null || echo "MCP_CONFIG_MISSING"
```

### If Missing or Incorrect

The `.mcp.json` file should already exist in the plugin. If it's missing, create it:

```bash
cat > ${CLAUDE_PLUGIN_ROOT}/.mcp.json << 'EOF'
{
  "codex": {
    "command": "codex",
    "args": ["-m", "gpt-5.2-codex", "mcp-server"]
  },
  "gemini": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server/dist/index.js"]
  }
}
EOF
```

**IMPORTANT**:
- Claude Code reads MCP configuration from `.mcp.json` in the plugin directory
- NOT from `~/.claude/settings.json` (legacy approach, no longer works)
- `${CLAUDE_PLUGIN_ROOT}` is automatically resolved by Claude Code

## Step 5: Install Orchestration Rules

```bash
mkdir -p ~/.claude/rules/delegator && cp ${CLAUDE_PLUGIN_ROOT}/rules/*.md ~/.claude/rules/delegator/
```

## Step 6: Verify Installation

Run these checks and report results:

```bash
# Check 1: Codex CLI version
codex --version 2>&1 | head -1 || echo "Not installed"

# Check 2: Gemini CLI version
gemini --version 2>&1 | head -1 || echo "Not installed"

# Check 3: .mcp.json exists
ls ${CLAUDE_PLUGIN_ROOT}/.mcp.json 2>/dev/null && echo "Configured" || echo "Not configured"

# Check 4: Gemini server built
ls ${CLAUDE_PLUGIN_ROOT}/mcp-servers/gemini-server/dist/index.js 2>/dev/null && echo "Built" || echo "Not built"

# Check 5: Rules installed (count files)
ls ~/.claude/rules/delegator/*.md 2>/dev/null | wc -l

# Check 6: Codex auth status
codex login status 2>&1 | head -1 || echo "Not authenticated"

# Check 7: Gemini auth status
gemini auth status 2>&1 | head -1 || echo "Not authenticated"
```

## Step 7: Report Status

Display actual values from the checks above:

```
claude-delegator Status (Multi-Provider)
═══════════════════════════════════════════════════════════════

GPT (Codex CLI)
───────────────────────────────────────────────────────────────
  CLI:         [✓/✗] [version or "Not installed"]
  Auth:        [✓/✗] [status - run `codex login` if needed]

Gemini (CLI)
───────────────────────────────────────────────────────────────
  CLI:         [✓/✗] [version or "Not installed"]
  MCP Server:  [✓/✗] [Built or "Not built"]
  Auth:        [✓/✗] [status - run `gemini auth login` if needed]

Claude (Direct)
───────────────────────────────────────────────────────────────
  Status:      ✓ Always available (no setup needed)

MCP Configuration
───────────────────────────────────────────────────────────────
  .mcp.json:   [✓/✗] ${CLAUDE_PLUGIN_ROOT}/.mcp.json

Rules
───────────────────────────────────────────────────────────────
  Installed:   [✓/✗] [N] files in ~/.claude/rules/delegator/

═══════════════════════════════════════════════════════════════
```

If any check fails, report the specific issue and how to fix it.

## Step 8: Final Instructions

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

## Step 9: Ask About Starring

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
