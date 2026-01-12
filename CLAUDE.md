# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin that provides multi-provider expert subagents via MCP:
- **GPT** (via Codex CLI) - Architecture and Security specialists
- **Gemini** (via custom MCP server) - UI/UX and Frontend specialists
- **Claude** (direct) - Code Review, Planning, and Scope Analysis

Seven domain experts that can advise OR implement across three AI providers.

## Development Commands

```bash
# Test plugin locally (loads from working directory)
claude --plugin-dir /path/to/claude-delegator

# Run setup to test installation flow
/claude-delegator:setup

# Run uninstall to test removal flow
/claude-delegator:uninstall

# Build Gemini MCP server
cd mcp-servers/gemini-server && npm install && npm run build
```

No build step for main plugin. Gemini MCP server requires build.

## Architecture

### Multi-Provider Orchestration

Claude acts as orchestrator—delegates to specialized experts based on task type and provider strengths.

```
User Request → Claude Code → [Match trigger → Select provider/expert]
                                    ↓
              ┌─────────────────────┼─────────────────────┐
              ↓                     ↓                     ↓
         GPT (Codex)            Gemini              Claude (Direct)
              ↓                     ↓                     ↓
         Architect             UI/UX Designer        Code Reviewer
         Security Analyst      Frontend Specialist   Plan Reviewer
                                                     Scope Analyst
              ↓                     ↓                     ↓
    Claude synthesizes response ←──┴──────────────────────┘
```

### Provider Selection

| Task Type | Provider | Expert | Why |
|-----------|----------|--------|-----|
| System architecture | GPT | Architect | Complex reasoning |
| Security audit | GPT | Security Analyst | Security expertise |
| UI/UX review | Gemini | UI/UX Designer | Multimodal, design focus |
| Frontend optimization | Gemini | Frontend Specialist | Large context, fast |
| Screenshot analysis | Gemini | (vision) | Multimodal capability |
| Code review | Claude | Code Reviewer | Direct, no latency |
| Plan validation | Claude | Plan Reviewer | Direct, no latency |
| Scope clarification | Claude | Scope Analyst | Direct, no latency |

### How Delegation Works

1. **Match trigger** - Check `rules/triggers.md` for semantic patterns
2. **Identify provider** - GPT, Gemini, or Claude based on task type
3. **Read expert prompt** - Load from `prompts/[expert].md`
4. **Build 7-section prompt** - Use format from `rules/delegation-format.md`
5. **Call MCP tool** - `mcp__codex__codex` or `mcp__gemini__gemini`
6. **Synthesize response** - Never show raw output; interpret and verify

### Component Relationships

| Component | Purpose | Notes |
|-----------|---------|-------|
| `rules/*.md` | When/how to delegate | Installed to `~/.claude/rules/delegator/` |
| `prompts/*.md` | Expert personalities | Injected via `developer-instructions` |
| `commands/*.md` | Slash commands | `/setup`, `/uninstall` |
| `config/providers.json` | Provider metadata | Configuration reference |
| `mcp-servers/gemini-server/` | Gemini MCP server | Requires build |

## Seven Experts Across Three Providers

### GPT Experts (via Codex)

| Expert | Prompt | Specialty | Triggers |
|--------|--------|-----------|----------|
| **Architect** | `prompts/architect.md` | System design, tradeoffs | "how should I structure", design questions |
| **Security Analyst** | `prompts/security-analyst.md` | Vulnerabilities | "is this secure", "harden this" |

### Gemini Experts

| Expert | Prompt | Specialty | Triggers |
|--------|--------|-----------|----------|
| **UI/UX Designer** | `prompts/ui-ux-designer.md` | Design systems, accessibility | "design review", screenshots |
| **Frontend Specialist** | `prompts/frontend-specialist.md` | React/Vue, performance | "optimize component", "bundle size" |

### Claude Experts (Direct)

| Expert | Prompt | Specialty | Triggers |
|--------|--------|-----------|----------|
| **Code Reviewer** | `prompts/code-reviewer.md` | Code quality, bugs | "review this code", "find issues" |
| **Plan Reviewer** | `prompts/plan-reviewer.md` | Plan validation | "review this plan" |
| **Scope Analyst** | `prompts/scope-analyst.md` | Requirements analysis | "clarify the scope" |

Every expert can operate in **advisory** (`sandbox: read-only`) or **implementation** (`sandbox: workspace-write`) mode.

## Key Design Decisions

1. **Multi-provider** - GPT for architecture/security, Gemini for UI/frontend, Claude for code/planning
2. **Native MCP** - Codex has `mcp-server`, Gemini uses custom MCP server
3. **Stateless calls** - Each delegation includes full context
4. **Dual mode** - Any expert can advise or implement based on task
5. **Synthesize, don't passthrough** - Claude interprets output, applies judgment
6. **Cost-aware routing** - Claude (free) > Gemini (low) > GPT (higher)

## When NOT to Delegate

- Simple syntax questions (answer directly)
- First attempt at any fix (try yourself first)
- Trivial file operations
- Research/documentation tasks
