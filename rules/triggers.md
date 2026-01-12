# Delegation Triggers

This file defines when to delegate to which provider and expert.

## IMPORTANT: Check These Triggers on EVERY Message

You MUST scan incoming messages for delegation triggers. This is NOT optional.

**Behavior:**
1. **PROACTIVE**: On every user message, check if semantic triggers match → delegate automatically
2. **REACTIVE**: If user explicitly mentions a provider → delegate immediately

When a trigger matches:
1. Identify the appropriate expert and provider
2. Read their prompt file from `${CLAUDE_PLUGIN_ROOT}/prompts/[expert].md`
3. Follow the delegation flow in `rules/orchestration.md`

---

## Provider & Expert Summary

| Provider | Tool | Experts |
|----------|------|---------|
| **GPT** | `mcp__codex__codex` | Architect, Security Analyst |
| **Gemini** | `mcp__gemini__gemini` | UI/UX Designer, Frontend Specialist |
| **Gemini** | `mcp__gemini__gemini-vision` | (screenshot analysis) |
| **Claude** | (direct) | Code Reviewer, Plan Reviewer, Scope Analyst |

---

## Explicit Triggers (Highest Priority)

User explicitly requests a provider:

| Phrase Pattern | Provider | Action |
|----------------|----------|--------|
| "ask GPT", "GPT로", "GPT한테" | GPT | Route based on context |
| "ask Gemini", "Gemini로", "제미나이" | Gemini | Route based on context |
| "review this architecture" | GPT | Architect |
| "security review", "is this secure" | GPT | Security Analyst |
| "UI review", "디자인 리뷰" | Gemini | UI/UX Designer |
| "frontend 최적화", "React 성능" | Gemini | Frontend Specialist |
| "review this code" | Claude | Code Reviewer |
| "review this plan" | Claude | Plan Reviewer |
| "clarify scope", "요구사항 분석" | Claude | Scope Analyst |

---

## Semantic Triggers by Provider

### GPT Triggers (→ Codex)

#### Architecture & Design (→ Architect)

| Intent Pattern | Example |
|----------------|---------|
| "how should I structure" | "How should I structure this service?" |
| "what are the tradeoffs" | "Tradeoffs of this caching approach" |
| "should I use [A] or [B]" | "Should I use microservices or monolith?" |
| System design questions | "Design a notification system" |
| After 2+ failed fix attempts | Escalation for fresh perspective |
| Database schema design | "How should I model this data?" |
| API architecture | "Design the API for this feature" |

#### Security (→ Security Analyst)

| Intent Pattern | Example |
|----------------|---------|
| "security implications" | "Security implications of this auth flow" |
| "is this secure" | "Is this token handling secure?" |
| "vulnerabilities in" | "Any vulnerabilities in this code?" |
| "threat model" | "Threat model for this API" |
| "harden this" | "Harden this endpoint" |
| Authentication/authorization | "Review our auth implementation" |

---

### Gemini Triggers

#### UI/UX Design (→ UI/UX Designer)

| Intent Pattern | Example |
|----------------|---------|
| "design review", "디자인 리뷰" | "Review this design" |
| "UI feedback", "UI 개선" | "How can I improve this UI?" |
| "accessibility", "접근성" | "Check accessibility of this form" |
| "component design" | "Design a modal component" |
| "design system" | "Create a design system for..." |
| Screenshot/mockup analysis | [image attached] |
| "responsive design" | "Is this responsive enough?" |
| "color scheme", "typography" | Visual design questions |

#### Frontend Development (→ Frontend Specialist)

| Intent Pattern | Example |
|----------------|---------|
| "React/Vue/Svelte" optimization | "Optimize this React component" |
| "bundle size", "번들 사이즈" | "Reduce the bundle size" |
| "frontend performance" | "Why is this component slow?" |
| "CSS architecture" | "How should I structure CSS?" |
| "state management" | "Best state management for this?" |
| "SSR/SSG" | "Should I use SSR here?" |
| Core Web Vitals | "Improve LCP/FID/CLS" |
| Component refactoring | "Refactor this component" |

---

### Claude Triggers (Handle Directly)

#### Code Review (→ Code Reviewer)

| Intent Pattern | Example |
|----------------|---------|
| "review this code" | "Review this PR" |
| "find issues in" | "Find issues in this implementation" |
| "what's wrong with" | "What's wrong with this function?" |
| "code quality" | "Is this code clean enough?" |
| After implementing features | Self-review before merge |

#### Plan Validation (→ Plan Reviewer)

| Intent Pattern | Example |
|----------------|---------|
| "review this plan" | "Review my migration plan" |
| "is this plan complete" | "Is this implementation plan complete?" |
| "validate before I start" | "Validate my approach before starting" |
| Before significant work | Pre-execution validation |

#### Requirements Analysis (→ Scope Analyst)

| Intent Pattern | Example |
|----------------|---------|
| "what am I missing" | "What am I missing in these requirements?" |
| "clarify the scope" | "Help clarify the scope of this feature" |
| Vague or ambiguous requests | Before planning unclear work |
| "before we start" | Pre-planning consultation |

---

## Trigger Priority

1. **Explicit user request** - Always honor direct provider requests
2. **Image/screenshot attached** - Route to Gemini vision
3. **Security concerns** - GPT Security Analyst
4. **Architecture decisions** - GPT Architect
5. **UI/Frontend tasks** - Gemini experts
6. **Code/Plan/Scope tasks** - Claude (direct)
7. **Default** - Handle directly (no delegation)

---

## When NOT to Delegate

| Situation | Reason |
|-----------|--------|
| Simple syntax questions | Answer directly |
| Direct file operations | No external insight needed |
| Trivial bug fixes | Obvious solution |
| Research/documentation | Use other tools |
| First attempt at any fix | Try yourself first |

---

## Advisory vs Implementation Mode

Any expert can operate in two modes:

| Mode | Sandbox | When to Use |
|------|---------|-------------|
| **Advisory** | `read-only` | Analysis, recommendations, review verdicts |
| **Implementation** | `workspace-write` | Actually making changes, fixing issues |

Set the sandbox based on what the task requires, not the expert type.

---

## Examples

### GPT Example
```typescript
// User: "Security review this auth flow"
mcp__codex__codex({
  prompt: "Review this authentication implementation for vulnerabilities...",
  "developer-instructions": "[contents of security-analyst.md]",
  sandbox: "read-only"
})
```

### Gemini Example
```typescript
// User: "Review this screenshot for UI issues"
mcp__gemini__gemini-vision({
  prompt: "Analyze this UI for accessibility, visual hierarchy, and UX issues",
  imagePath: "/path/to/screenshot.png"
})
```

### Gemini Frontend Example
```typescript
// User: "Optimize this React component"
mcp__gemini__gemini({
  prompt: "TASK: Optimize this React component for performance...",
  "developer-instructions": "[contents of frontend-specialist.md]",
  model: "gemini-2.5-pro"
})
```

### Claude Example (Direct)
```typescript
// User: "Review this code"
// No MCP call - handle directly using code-reviewer.md guidance
// Read the prompt file for persona, then apply it yourself
```
