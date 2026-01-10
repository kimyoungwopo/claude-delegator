# Model Selection Guidelines

Codex (GPT) serves as a strategic advisor for complex problems. Use it sparingly and intentionally.

## GPT (Codex) — Oracle Role

**Tool:** `mcp__codex__codex`

### When to Consult the Oracle

| Situation | Trigger |
|-----------|---------|
| Architecture decisions | System design, database schemas, API design |
| Complex debugging | After 2+ failed fix attempts |
| Code review | Multi-system thinking, edge case identification |
| Security analysis | Threat modeling, vulnerability assessment |
| Tradeoff analysis | When multiple valid approaches exist |
| Unfamiliar patterns | Domain-specific best practices |

### Oracle Philosophy

The oracle operates with **pragmatic minimalism**:

> Favor the least complex solution that fulfills actual requirements over theoretically optimal approaches.

Priorities:
1. Existing code patterns in the codebase
2. Developer experience
3. Maintainability over cleverness

### Oracle Response Format

Recommendations follow this structure:

**Essential** (always provided):
- Bottom line / recommendation
- Action plan
- Effort estimate: Quick / Short / Medium / Large

**Expanded** (when relevant):
- Reasoning
- Risk assessment

**Edge cases** (only if applicable):
- Escalation conditions
- Alternatives

### Codex Parameters

```typescript
mcp__codex__codex({
  prompt: "...",
  // model selection handled by Codex CLI configuration
  "approval-policy": "on-request", // ask before tool use
  "developer-instructions": "..."  // role prompt injection
})
```

---

## When NOT to Consult

See `rules/triggers.md` for the complete list of when NOT to delegate.

---

## Cost-Benefit Analysis

### Worth the Cost

- Architectural decisions with long-term impact
- Security concerns that could cause vulnerabilities
- After multiple failed attempts (fresh perspective)
- Complex multi-system interactions
- Decisions affecting system scalability

### Not Worth the Cost

- Questions you could answer with a quick search
- Trivial code changes
- Style or formatting decisions
- Simple CRUD operations

---

## Codex Parameters Reference

| Parameter | Values | Default | Notes |
|-----------|--------|---------|-------|
| `approval-policy` | `untrusted`, `on-failure`, `on-request`, `never` | `on-request` | Controls tool approval |
| `sandbox` | `read-only`, `workspace-write`, `danger-full-access` | `read-only` | File access level |
| `cwd` | path | current | Working directory |
| `developer-instructions` | string | - | System prompt injection |

Model selection is handled by your Codex CLI configuration, not passed per-call.
