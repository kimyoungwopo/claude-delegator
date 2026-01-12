# Model Orchestration

You have access to multiple AI experts via MCP tools. Use them strategically based on these guidelines.

## Available Tools

| Tool | Provider | Use For |
|------|----------|---------|
| `mcp__codex__codex` | GPT | Architecture, Security (stateless) |
| `mcp__gemini__gemini` | Gemini | UI/UX, Frontend (stateless) |
| `mcp__gemini__gemini-vision` | Gemini | Image/screenshot analysis |
| **Direct (Claude)** | Self | Code review, Planning, Scope analysis |

> **Note:** Each MCP delegation is independent—include full context in every call.

## Available Experts

### GPT Experts (via Codex)

| Expert | Specialty | Prompt File |
|--------|-----------|-------------|
| **Architect** | System design, tradeoffs, complex debugging | `${CLAUDE_PLUGIN_ROOT}/prompts/architect.md` |
| **Security Analyst** | Vulnerabilities, threat modeling | `${CLAUDE_PLUGIN_ROOT}/prompts/security-analyst.md` |

### Gemini Experts

| Expert | Specialty | Prompt File |
|--------|-----------|-------------|
| **UI/UX Designer** | Design systems, accessibility, visual review | `${CLAUDE_PLUGIN_ROOT}/prompts/ui-ux-designer.md` |
| **Frontend Specialist** | React/Vue, performance, CSS architecture | `${CLAUDE_PLUGIN_ROOT}/prompts/frontend-specialist.md` |

### Claude Experts (Handle Directly)

| Expert | Specialty | Prompt File |
|--------|-----------|-------------|
| **Code Reviewer** | Code quality, bugs, best practices | `${CLAUDE_PLUGIN_ROOT}/prompts/code-reviewer.md` |
| **Plan Reviewer** | Plan validation before execution | `${CLAUDE_PLUGIN_ROOT}/prompts/plan-reviewer.md` |
| **Scope Analyst** | Pre-planning, catching ambiguities | `${CLAUDE_PLUGIN_ROOT}/prompts/scope-analyst.md` |

---

## Provider Selection Guide

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

---

## Stateless Design

**Each MCP delegation is independent.** The expert has no memory of previous calls.

**Implications:**
- Include ALL relevant context in every delegation prompt
- For retries, include what was attempted and what failed
- Don't assume the expert remembers previous interactions

---

## PROACTIVE Delegation (Check on EVERY message)

Before handling any request, check if an expert would help:

| Signal | Provider | Expert |
|--------|----------|--------|
| Architecture/design decision | GPT | Architect |
| 2+ failed fix attempts on same issue | GPT | Architect (fresh perspective) |
| Security concerns, "is this secure" | GPT | Security Analyst |
| UI/UX review, "design feedback" | Gemini | UI/UX Designer |
| Frontend performance, "React optimize" | Gemini | Frontend Specialist |
| Screenshot/image analysis | Gemini | (vision tool) |
| "Review this plan", "validate approach" | Claude | Plan Reviewer |
| Vague/ambiguous requirements | Claude | Scope Analyst |
| "Review this code", "find issues" | Claude | Code Reviewer |

**If a signal matches → delegate to the appropriate expert.**

---

## REACTIVE Delegation (Explicit User Request)

When user explicitly requests a provider:

| User Says | Action |
|-----------|--------|
| "ask GPT", "consult GPT" | Route to GPT expert based on context |
| "ask Gemini", "use Gemini" | Route to Gemini expert based on context |
| "GPT로", "GPT한테" | Route to GPT |
| "Gemini로", "제미나이한테" | Route to Gemini |

**Always honor explicit requests.**

---

## Delegation Flow (Step-by-Step)

When delegation is triggered:

### Step 1: Identify Expert & Provider
Match the task to the appropriate expert and provider based on triggers.

### Step 2: Read Expert Prompt
**CRITICAL**: Read the expert's prompt file to get their system instructions:

```
Read ${CLAUDE_PLUGIN_ROOT}/prompts/[expert].md
```

### Step 3: Determine Mode
| Task Type | Mode | Sandbox |
|-----------|------|---------|
| Analysis, review, recommendations | Advisory | `read-only` |
| Make changes, fix issues, implement | Implementation | `workspace-write` |

### Step 4: Notify User
Always inform the user before delegating:
```
Delegating to [Expert Name] ([Provider]): [brief task summary]
```

### Step 5: Build Delegation Prompt
Use the 7-section format from `rules/delegation-format.md`.

### Step 6: Call the Expert

**For GPT (Codex):**
```typescript
mcp__codex__codex({
  prompt: "[your 7-section delegation prompt]",
  "developer-instructions": "[contents of the expert's prompt file]",
  sandbox: "[read-only or workspace-write]",
  cwd: "[current working directory]"
})
```

**For Gemini:**
```typescript
mcp__gemini__gemini({
  prompt: "[your 7-section delegation prompt]",
  "developer-instructions": "[contents of the expert's prompt file]",
  model: "gemini-2.5-pro"  // or gemini-2.0-flash for speed
})
```

**For Gemini Vision (screenshots):**
```typescript
mcp__gemini__gemini-vision({
  prompt: "[your question about the image]",
  imagePath: "[path to screenshot]"
})
```

**For Claude (direct):**
Handle directly using the expert's prompt as guidance. No MCP call needed.

### Step 7: Handle Response
1. **Synthesize** - Never show raw output directly
2. **Extract insights** - Key recommendations, issues, changes
3. **Apply judgment** - Experts can be wrong; evaluate critically
4. **Verify implementation** - For implementation mode, confirm changes work

---

## Retry Flow (Implementation Mode)

When implementation fails verification:

```
Attempt 1 → Verify → [Fail]
     ↓
Attempt 2 (new call with: original task + what was tried + error details)
     ↓
Attempt 3 (new call with: full history)
     ↓
Escalate to user
```

---

## Example: UI/UX Review with Screenshot

User: "Review this design" (attaches screenshot)

**Step 1**: Signal matches "UI/UX review" → Gemini → UI/UX Designer

**Step 2**: Read `${CLAUDE_PLUGIN_ROOT}/prompts/ui-ux-designer.md`

**Step 3**: Advisory mode → `read-only`

**Step 4**: "Delegating to UI/UX Designer (Gemini): Analyze design screenshot"

**Step 5-6**:
```typescript
mcp__gemini__gemini-vision({
  prompt: `Analyze this UI design for:
- Visual hierarchy and layout
- Accessibility concerns
- Responsive design considerations
- Consistency with modern design patterns`,
  imagePath: "/path/to/screenshot.png"
})
```

**Step 7**: Synthesize response with your assessment.

---

## Example: Architecture Question

User: "What are the tradeoffs of Redis vs in-memory caching?"

**Step 1**: Signal matches "Architecture decision" → GPT → Architect

**Step 2**: Read `${CLAUDE_PLUGIN_ROOT}/prompts/architect.md`

**Step 3**: Advisory mode → `read-only`

**Step 4**: "Delegating to Architect (GPT): Analyze caching tradeoffs"

**Step 5-6**:
```typescript
mcp__codex__codex({
  prompt: `TASK: Analyze tradeoffs between Redis and in-memory caching.
EXPECTED OUTCOME: Clear recommendation with rationale.
CONTEXT: [user's situation]
...`,
  "developer-instructions": "[contents of architect.md]",
  sandbox: "read-only"
})
```

---

## Cost Awareness

| Provider | Cost | Speed | Use For |
|----------|------|-------|---------|
| Claude (direct) | Free | Fastest | Default for code review, planning |
| Gemini | Low | Fast | UI/UX, frontend, vision tasks |
| GPT | Higher | Medium | Architecture, security (high-value) |

- **Prefer Claude** for tasks it handles well (no external call overhead)
- **Use Gemini** for visual/frontend work (cost-effective, multimodal)
- **Reserve GPT** for architecture and security (high-value decisions)

---

## Anti-Patterns

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Delegate trivial questions | Answer directly |
| Show raw expert output | Synthesize and interpret |
| Use GPT for UI tasks | Use Gemini (multimodal) |
| Use Gemini for security | Use GPT (specialized) |
| Skip user notification | ALWAYS notify before delegating |
| Forget to include context | Include FULL history in every call |
