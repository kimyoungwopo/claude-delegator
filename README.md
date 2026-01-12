# Claude Delegator

Multi-provider AI expert subagents for Claude Code. Seven specialists across GPT, Gemini, and Claude that can analyze AND implement—architecture, security, UI/UX, frontend, code review, and more.

[![License](https://img.shields.io/github/license/kimyoungwopo/claude-delegator?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/kimyoungwopo/claude-delegator?v=2)](https://github.com/kimyoungwopo/claude-delegator/stargazers)

**[한국어 README](README.ko.md)**

![Claude Delegator in action](claude-delegator.png)

## Install

Inside a Claude Code instance, run the following commands:

**Step 1: Install CLIs**
```bash
npm install -g @openai/codex
npm install -g @google/gemini-cli
```

**Step 2: Authenticate**
```bash
codex login
gemini auth login
```

**Step 3: Add the marketplace**
```
/plugin marketplace add kimyoungwopo/claude-delegator
```

**Step 4: Install the plugin**
```
/plugin install claude-delegator
```

**Step 5: Run setup**
```
/claude-delegator:setup
```

**Step 6: Restart Claude Code**

MCP servers are loaded on startup. Restart Claude Code to activate the `codex` and `gemini` tools.

Done! Claude now routes complex tasks to the right AI expert automatically.

---

## What is Claude Delegator?

Claude gains a team of AI specialists via MCP. Each expert has a distinct specialty and can advise OR implement.

| What You Get | Why It Matters |
|--------------|----------------|
| **7 domain experts** | Right specialist for each problem type |
| **3 AI providers** | GPT, Gemini, and Claude working together |
| **Dual mode** | Experts can analyze (read-only) or implement (write) |
| **Auto-routing** | Claude detects when and where to delegate |

---

## The Experts

### GPT (via Codex CLI) — Architecture & Security

| Expert | What They Do | Example Triggers |
|--------|--------------|------------------|
| **Architect** | System design, tradeoffs, complex debugging | "How should I structure this?" / "What are the tradeoffs?" |
| **Security Analyst** | Vulnerabilities, threat modeling | "Is this secure?" / "Harden this endpoint" |

### Gemini (via CLI) — UI/UX & Frontend

| Expert | What They Do | Example Triggers |
|--------|--------------|------------------|
| **UI/UX Designer** | Design systems, accessibility, visual review | "Review this design" / "Check accessibility" |
| **Frontend Specialist** | React/Vue optimization, performance | "Optimize this component" / "Reduce bundle size" |

### Claude (Direct) — Code Quality & Planning

| Expert | What They Do | Example Triggers |
|--------|--------------|------------------|
| **Code Reviewer** | Find bugs, improve quality | "Review this PR" / "What's wrong with this?" |
| **Plan Reviewer** | Validate plans before you start | "Review this migration plan" |
| **Scope Analyst** | Catch ambiguities early | "What am I missing?" / "Clarify the scope" |

---

## How It Works

```
You: "Review this UI design"
                    ↓
Claude: [Detects UI task → selects Gemini UI/UX Designer]
                    ↓
        ┌─────────────────────────────┐
        │  mcp__gemini__gemini        │
        │  → UI/UX Designer prompt    │
        │  → Gemini analyzes design   │
        └─────────────────────────────┘
                    ↓
Claude: "Based on the analysis, I found 3 accessibility issues..."
        [Synthesizes response, applies judgment]
```

### Provider Routing

| Task Type | Provider | Expert |
|-----------|----------|--------|
| System architecture | GPT | Architect |
| Security audit | GPT | Security Analyst |
| UI/UX review | Gemini | UI/UX Designer |
| Frontend optimization | Gemini | Frontend Specialist |
| Screenshot analysis | Gemini | (vision) |
| Code review | Claude | Code Reviewer |
| Plan validation | Claude | Plan Reviewer |
| Scope clarification | Claude | Scope Analyst |

---

## Configuration

### Operating Modes

Every expert supports two modes based on the task:

| Mode | Sandbox | Use When |
|------|---------|----------|
| **Advisory** | `read-only` | Analysis, recommendations, reviews |
| **Implementation** | `workspace-write` | Making changes, fixing issues |

### How MCP Servers Are Configured

Claude Code loads MCP servers from the `.mcp.json` file in the plugin directory. This file is included with the plugin:

```json
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
```

> **Note:** The `settings.json` approach (`~/.claude/settings.json` with `mcpServers`) is deprecated and no longer works. MCP configuration must be in `.mcp.json`.

### Customizing Expert Prompts

Expert prompts live in `prompts/`. Edit these to customize expert behavior for your workflow.

---

## Requirements

| Provider | Install | Auth |
|----------|---------|------|
| **GPT** | `npm install -g @openai/codex` | `codex login` |
| **Gemini** | `npm install -g @google/gemini-cli` | `gemini auth login` |
| **Claude** | Built-in | None needed |

---

## Commands

| Command | Description |
|---------|-------------|
| `/claude-delegator:setup` | Configure MCP servers and install rules |
| `/claude-delegator:uninstall` | Remove MCP config and rules |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP tools not available | Restart Claude Code after setup |
| `mcp__codex__codex` not found | Check `.mcp.json` exists in plugin directory |
| Codex not authenticated | Run `codex login` |
| Gemini not authenticated | Run `gemini auth login` |
| Expert not triggered | Try explicit: "Ask GPT to..." or "Use Gemini for..." |

### Verifying MCP Configuration

After restarting Claude Code, you should see `codex` and `gemini` MCP tools available. If not:

1. Check that `.mcp.json` exists in the plugin directory
2. Verify Gemini MCP server is built: `ls ~/.claude/plugins/cache/.../mcp-servers/gemini-server/dist/index.js`
3. Check Claude Code debug logs: `~/.claude/debug/latest`

---

## Development

```bash
git clone https://github.com/kimyoungwopo/claude-delegator
cd claude-delegator

# Build Gemini MCP server
cd mcp-servers/gemini-server
npm install && npm run build

# Test locally
claude --plugin-dir /path/to/claude-delegator
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## Acknowledgments

Based on [jarrodwatts/claude-delegator](https://github.com/jarrodwatts/claude-delegator) by [@jarrodwatts](https://github.com/jarrodwatts).

Expert prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by [@code-yeongyu](https://github.com/code-yeongyu).

---

## License

MIT — see [LICENSE](LICENSE)

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=kimyoungwopo/claude-delegator&type=Date&v=2)](https://star-history.com/#kimyoungwopo/claude-delegator&Date)
