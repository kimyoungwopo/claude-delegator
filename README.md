# claude-delegator

![MCP Tools](https://img.shields.io/badge/Integration-MCP%20Tools-blue)
![Provider](https://img.shields.io/badge/Provider-Codex%20(GPT)-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

GPT expert subagents for Claude Code via Codex CLI. Five specialized experts that can advise OR implement: architecture, code review, security, and more.

---

## Install

Inside a Claude Code instance:

```
/plugin marketplace add jarrodwatts/claude-delegator
/plugin install claude-delegator
/claude-delegator:setup
```

Done! Claude now has access to GPT expert subagents.

> **Note**: Requires Codex CLI. Setup will guide you through installation.

---

## What is claude-delegator?

Claude Code gains access to specialized GPT experts via native MCP tool calls. Each expert can analyze AND implement—not just advise.

| Feature | What It Does |
|---------|-------------|
| **Native MCP Tool** | `mcp__codex__codex` appears as a regular tool |
| **5 Domain Experts** | Architect, Code Reviewer, Security Analyst, and more |
| **Dual Mode** | Each expert can advise (read-only) or implement (write) |
| **Response Synthesis** | Claude interprets GPT output, never raw passthrough |

### GPT Experts

| Expert | Specialty | Example Use |
|--------|-----------|-------------|
| **Architect** | System design, tradeoffs | "Design a caching layer" |
| **Plan Reviewer** | Plan validation | "Review this migration plan" |
| **Scope Analyst** | Requirements analysis | "Clarify the scope of this feature" |
| **Code Reviewer** | Code quality, bugs | "Review this PR for issues" |
| **Security Analyst** | Vulnerabilities, threats | "Harden this authentication flow" |

### When to Use GPT Experts

| Use For | Example |
|---------|---------|
| Architecture decisions | "Review this database schema" |
| Debugging escalation | After 2+ failed fix attempts |
| Code review | "What am I missing in this auth flow?" |
| Security analysis | "Threat model for this API" |
| Requirements clarification | "What ambiguities exist in this spec?" |

### When NOT to Use GPT Experts

- Simple file operations
- First attempt at any fix
- Trivial decisions
- Research or documentation

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        Claude Code                               │
│                                                                  │
│   User: "Is this authentication flow secure?"                   │
│                                                                  │
│   Claude: [Detects security question]                           │
│           [Calls mcp__codex__codex with Security Analyst]       │
│                                                                  │
│           ┌──────────────────────────────────────┐              │
│           │  MCP Server: codex                   │              │
│           │  → Security Analyst expert           │              │
│           │  → Returns vulnerability analysis    │              │
│           └──────────────────────────────────────┘              │
│                                                                  │
│   Claude: "Based on the security analysis, I found..."          │
└─────────────────────────────────────────────────────────────────┘
```

### Plugin Structure

```
claude-delegator/
├── rules/                    # Installed to ~/.claude/rules/delegator/
│   ├── orchestration.md      # Delegation flow
│   ├── triggers.md           # When to use each expert
│   ├── model-selection.md    # Expert details
│   └── delegation-format.md  # Prompt templates
├── prompts/
│   ├── architect.md          # System design expert
│   ├── plan-reviewer.md      # Plan validation expert
│   ├── scope-analyst.md      # Requirements expert
│   ├── code-reviewer.md      # Code quality expert
│   └── security-analyst.md   # Security expert
├── commands/
│   ├── setup.md              # /claude-delegator:setup
│   └── configure.md          # /claude-delegator:configure
└── config/
    └── providers.json        # Provider configuration
```

---

## Configuration

### Available Tools

| Tool | Description |
|------|-------------|
| `mcp__codex__codex` | Start a conversation with a GPT expert |
| `mcp__codex__codex-reply` | Continue an existing conversation |

### Expert Prompts

| Expert | Prompt File | Specialty |
|--------|-------------|-----------|
| Architect | `prompts/architect.md` | System design, tradeoffs |
| Plan Reviewer | `prompts/plan-reviewer.md` | Plan validation |
| Scope Analyst | `prompts/scope-analyst.md` | Requirements analysis |
| Code Reviewer | `prompts/code-reviewer.md` | Code quality, bugs |
| Security Analyst | `prompts/security-analyst.md` | Vulnerabilities, threats |

### Operating Modes

Every expert supports two modes:

| Mode | Sandbox | Use When |
|------|---------|----------|
| **Advisory** | `read-only` | Analysis, recommendations |
| **Implementation** | `workspace-write` | Making changes |

### Example Call

```typescript
// Security Analyst in advisory mode
mcp__codex__codex({
  prompt: "Review this auth flow for vulnerabilities",
  sandbox: "read-only",
  "developer-instructions": "<security-analyst prompt>"
})

// Security Analyst in implementation mode
mcp__codex__codex({
  prompt: "Fix the SQL injection in user.ts",
  sandbox: "workspace-write",
  "developer-instructions": "<security-analyst prompt>"
})
```

### Manual MCP Setup

If `/setup` doesn't work, manually add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["mcp-server"]
    }
  }
}
```

---

## Requirements

| Dependency | Installation |
|------------|--------------|
| Codex CLI | `npm install -g @openai/codex` |

### Authentication

```bash
codex login
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/claude-delegator:setup` | Configure MCP server, install rules |
| `/claude-delegator:configure` | Check status, test, or remove |

---

## Testing

Test the plugin locally with your working copy:

```bash
claude --plugin-dir /path/to/claude-delegator
```

This loads the plugin without reinstalling.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP server not found | Restart Claude Code after setup |
| Codex not authenticated | Run `codex login` |
| Tool not appearing | Check `~/.claude/settings.json` has codex entry |

---

## Acknowledgments

Expert prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [@code-yeongyu](https://github.com/code-yeongyu).

---

## License

MIT License - see [LICENSE](LICENSE) for details.
