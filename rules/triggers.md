# Delegation Triggers

This file defines when to delegate to Codex (GPT) as the oracle.

## Explicit Triggers (Highest Priority)

These phrases trigger immediate delegation. User intent is clear.

| Phrase Pattern | Action |
|----------------|--------|
| "ask GPT", "consult GPT", "GPT's opinion" | `mcp__codex__codex` |
| "get a second opinion" | `mcp__codex__codex` |
| "oracle" | `mcp__codex__codex` with oracle role |
| "what does GPT think" | `mcp__codex__codex` |
| "review this with GPT" | `mcp__codex__codex` |

## Semantic Triggers (Intent Matching)

When user intent matches these patterns, consider delegation.

### Architecture & Design (→ Oracle)

| Intent Pattern | Example |
|----------------|---------|
| "review this architecture" | "Review this database schema" |
| "is this design sound" | "Is this API design sound?" |
| "what are the tradeoffs" | "Tradeoffs of this caching approach" |
| "should I use [pattern A] or [pattern B]" | "Should I use microservices or monolith?" |
| "how should I structure" | "How should I structure this service?" |

### Security (→ Oracle)

| Intent Pattern | Example |
|----------------|---------|
| "security implications of" | "Security implications of this auth flow" |
| "is this secure" | "Is this token handling secure?" |
| "vulnerability in" | "Any vulnerabilities in this code?" |
| "threat model" | "Threat model for this API" |

### Code Review (→ Oracle)

| Intent Pattern | Example |
|----------------|---------|
| "code review [code]" | "Code review this function" |
| "review for edge cases" | "Review for edge cases in this logic" |
| "what am I missing" | "What am I missing in this implementation?" |

### Debugging Escalation (→ Oracle)

| Condition | Action |
|-----------|--------|
| 2+ failed fix attempts | Suggest oracle escalation |
| "why is this failing" (after attempts) | Oracle with full failure context |
| "I've tried everything" | Oracle with documented attempts |

## Trigger Priority

1. **Explicit user request** - Always honor direct requests
2. **Failure escalation** - After documented failures
3. **Semantic intent match** - When pattern clearly matches oracle scope
4. **Don't delegate** - Default: answer directly

## When NOT to Delegate

| Situation | Reason |
|-----------|--------|
| Simple syntax questions | You know the answer |
| Direct file operations | No external insight needed |
| Trivial bug fixes | Obvious solution |
| Research/documentation | Not oracle's strength |
| Frontend/UI tasks | Not oracle's strength |
| User just wants info | Answer directly |

## Context-Dependent Triggers

```
IF 2+ fix attempts failed
AND error persists
THEN suggest oracle escalation

IF user is frustrated
AND problem is complex
THEN offer oracle consultation

IF architectural decision
AND long-term impact
THEN recommend oracle review
```

## Role: Oracle

The oracle role auto-injects a system prompt emphasizing:
- Pragmatic minimalism
- Existing codebase patterns
- Developer experience
- Clear action plans with effort estimates

See `prompts/oracle.md` for full prompt.
