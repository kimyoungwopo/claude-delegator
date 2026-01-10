# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin that provides GPT (via Codex CLI) as a native MCP tool for strategic consultation. Use sparingly for complex architecture, debugging escalation, and code review.

## Development Commands

```bash
# Test plugin installation
/claude-delegator:setup

# Check status
/claude-delegator:configure status
```

No build step, no dependencies. Uses Codex CLI's native MCP server.

## Architecture

### Data Flow

```
User Request → Claude Code → [Match oracle trigger?]
                                    ↓
                    Yes → mcp__codex__codex (GPT)
                                    ↓
                    [Role prompt via developer-instructions]
                                    ↓
                    [Response] → Claude synthesizes
```

### Component Relationships

| Component | Location | Installed To | Purpose |
|-----------|----------|--------------|---------|
| Rules | `rules/*.md` | `~/.claude/rules/delegator/` | Teaches when/how to delegate |
| Prompts | `prompts/*.md` | Referenced in delegation | Shapes GPT behavior |
| Commands | `commands/*.md` | Plugin namespace | `/setup`, `/configure` |
| Config | `config/providers.json` | Read at runtime | Provider configuration |

### Roles

| Role | Purpose | When to Use |
|------|---------|-------------|
| `oracle` | Strategic advisor | Architecture, debugging escalation, code review, security |
| `momus` | Plan reviewer | Validate work plans before execution |

> Role prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

## Key Design Decisions

1. **Native MCP only** - Codex has `codex mcp-server`, no wrapper needed
2. **Focused scope** - Oracle for strategic decisions, not everything
3. **Response synthesis** - Claude interprets GPT output, never raw passthrough
4. **Pragmatic minimalism** - Favor simplest solution that works

## When to Invoke

**DO use for**:
- Architecture decisions with long-term impact
- After 2+ failed fix attempts
- Security/performance concerns
- Multi-system tradeoffs
- Code review for significant changes

**DON'T use for**:
- Simple file operations
- First attempt at any fix
- Trivial decisions
- Research or documentation
- Frontend/UI generation

## Plugin Structure

```
claude-delegator/
├── commands/
│   ├── setup.md       # /claude-delegator:setup
│   └── configure.md   # /claude-delegator:configure
├── rules/
│   ├── orchestration.md
│   ├── triggers.md
│   ├── model-selection.md
│   └── delegation-format.md
├── prompts/
│   ├── oracle.md      # Strategic advisor prompt
│   ├── momus.md       # Plan reviewer prompt
│   └── README.md
└── config/
    └── providers.json
```
