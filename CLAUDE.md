# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin that provides GPT (via Codex CLI) as specialized expert subagents. Five domain experts that can advise OR implement: Architect, Plan Reviewer, Scope Analyst, Code Reviewer, and Security Analyst.

## Development Commands

```bash
# Test plugin installation
/claude-delegator:setup

# Uninstall
/claude-delegator:configure
```

No build step, no dependencies. Uses Codex CLI's native MCP server.

## Architecture

### Expert Model

Claude acts as orchestrator—delegates to specialized GPT experts based on task type.

```
User Request → Claude Code → [Identify expert needed]
                                    ↓
              ┌─────────────────────┼─────────────────────┐
              ↓                     ↓                     ↓
         Architect            Code Reviewer        Security Analyst
              ↓                     ↓                     ↓
    [Advisory OR Implementation mode based on task]
              ↓                     ↓                     ↓
         Report to user ←──────────┴──────────────────────┘
```

### Five GPT Experts

| Expert | Specialty | Best For |
|--------|-----------|----------|
| **Architect** | System design | Architecture, tradeoffs, complex debugging |
| **Plan Reviewer** | Plan validation | Reviewing plans before execution |
| **Scope Analyst** | Requirements | Catching ambiguities, pre-planning |
| **Code Reviewer** | Code quality | Code review, finding bugs |
| **Security Analyst** | Security | Vulnerabilities, threat modeling |

### Operating Modes

Every expert can operate in two modes:

| Mode | Sandbox | Use When |
|------|---------|----------|
| **Advisory** | `read-only` | Analysis, recommendations, reviews |
| **Implementation** | `workspace-write` | Making changes, fixing issues |

**Key principle**: The mode is determined by the task, not the expert.

### Component Relationships

| Component | Location | Purpose |
|-----------|----------|---------|
| Rules | `rules/*.md` | Teaches when/how to delegate |
| Prompts | `prompts/*.md` | Expert personality and behavior |
| Commands | `commands/*.md` | `/setup`, `/configure` |
| Config | `config/providers.json` | Provider configuration |

> Expert prompts adapted from [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)

## Key Design Decisions

1. **Native MCP only** - Codex has `codex mcp-server`, no wrapper needed
2. **Domain experts** - Each expert has distinct specialty and philosophy
3. **Dual mode** - Any expert can advise or implement based on task
4. **Verify then report** - Claude verifies implementation output before reporting
5. **Retry with codex-reply** - Up to 3 attempts before escalating failures

## When to Use Each Expert

### Architect
- "How should I structure this service?"
- "What are the tradeoffs of Redis vs in-memory?"
- "Design a notification system"
- After 2+ failed fix attempts

### Plan Reviewer
- "Review this migration plan"
- "Is this implementation plan complete?"
- Before starting significant work

### Scope Analyst
- "What am I missing in these requirements?"
- "Clarify the scope of this feature"
- When requirements feel vague

### Code Reviewer
- "Review this PR"
- "Find issues in this implementation"
- After implementing features (self-review)

### Security Analyst
- "Is this authentication flow secure?"
- "Threat model for this API"
- "Harden this endpoint"

## Plugin Structure

```
claude-delegator/
├── commands/
│   ├── setup.md              # /claude-delegator:setup
│   └── configure.md          # /claude-delegator:configure
├── rules/
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
└── config/
    └── providers.json
```
