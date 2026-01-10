# Model Orchestration

You have access to GPT via MCP tools. Use it strategically based on these guidelines.

## Available Tools

| Tool | Provider | Use For |
|------|----------|---------|
| `mcp__codex__codex` | GPT | Architecture, debugging, code review, security |
| `mcp__codex__codex-reply` | GPT | Continue GPT conversation |

## Phase 0: Delegation Check (EVERY message)

Before classifying a request, check if delegation would help:

| Signal | Action |
|--------|--------|
| Complex architecture decision | Delegate to GPT (oracle role) |
| 2+ failed fix attempts on same issue | Escalate to GPT for fresh perspective |
| User explicitly asks for external opinion | Honor the request immediately |
| Security/performance analysis | Delegate to GPT (oracle role) |
| Work plan needs validation | Delegate to GPT (momus role) |

## Response Handling (MANDATORY)

When external model returns a response:

1. **ALWAYS synthesize** - Never show raw output directly
2. **Extract insights** - Pull out key recommendations, concerns, code snippets
3. **Apply judgment** - External models can be wrong; evaluate their suggestions
4. **Disagree when warranted** - If you spot issues, say so and explain why
5. **Integrate with context** - Connect their response to the user's specific situation

### Example Synthesis

```
External model said: [summary of their response]

Key points:
- [insight 1]
- [insight 2]

My assessment: [your evaluation, any disagreements, how this applies to the task]
```

## Delegation Prompt Structure (MANDATORY)

Use the 7-section format from `rules/delegation-format.md`. Every delegation MUST include: TASK, EXPECTED OUTCOME, CONTEXT, CONSTRAINTS, MUST DO, MUST NOT DO, OUTPUT FORMAT.

## Multi-Role Consultation

For complex decisions, you MAY consult GPT with different roles:

```typescript
// Oracle for architecture analysis
mcp__codex__codex({ prompt: "[oracle role prompt] Analyze architecture tradeoffs..." })

// Momus for plan validation
mcp__codex__codex({ prompt: "[momus role prompt] Review this implementation plan..." })
```

Synthesize recommendations with your own judgment - external models can be wrong.

## Escalation Pattern

After 2+ consecutive failures on the same issue:

1. **Document what you've tried** - List approaches and why they failed
2. **Suggest escalation** - "I've tried X and Y without success. Should I escalate to GPT for a fresh perspective?"
3. **Wait for user approval** - Don't escalate automatically
4. **Provide full context** - When escalating, include failure history

## Cost Awareness

External model calls cost money. Use them strategically:

- **Don't spam** - One well-structured delegation beats five vague ones
- **Reserve for high-value tasks** - Architecture, security, complex debugging, plan validation
- **Avoid redundant calls** - If you already have the answer, don't delegate
- **Use reply tools** - Continue conversations with `codex-reply` instead of starting fresh

## Anti-Patterns

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Delegate trivial questions | Answer directly |
| Show raw external output | Synthesize and interpret |
| Delegate without context | Include all 7 sections |
| Ignore external model errors | Investigate and retry or escalate |
| Spam multiple calls | One structured call |
| Auto-escalate without asking | Suggest escalation, wait for approval |
