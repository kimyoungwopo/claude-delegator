# Claude Delegator

Claude Code를 위한 멀티 프로바이더 AI 전문가 서브에이전트. GPT, Gemini, Claude를 아우르는 7명의 전문가가 분석과 구현을 모두 수행합니다—아키텍처, 보안, UI/UX, 프론트엔드, 코드 리뷰 등.

[![License](https://img.shields.io/github/license/jarrodwatts/claude-delegator?v=2)](LICENSE)
[![Stars](https://img.shields.io/github/stars/jarrodwatts/claude-delegator?v=2)](https://github.com/jarrodwatts/claude-delegator/stargazers)

**[English README](README.md)**

![Claude Delegator in action](claude-delegator.png)

## 설치

Claude Code에서 다음 명령어를 실행하세요:

**Step 1: CLI 설치**
```bash
npm install -g @openai/codex
npm install -g @google/gemini-cli
```

**Step 2: 인증**
```bash
codex login
gemini auth login
```

**Step 3: 마켓플레이스 추가**
```
/plugin marketplace add jarrodwatts/claude-delegator
```

**Step 4: 플러그인 설치**
```
/plugin install claude-delegator
```

**Step 5: 설정 실행**
```
/claude-delegator:setup
```

완료! 이제 Claude가 복잡한 작업을 적절한 AI 전문가에게 자동으로 라우팅합니다.

---

## Claude Delegator란?

Claude가 MCP를 통해 AI 전문가 팀을 얻습니다. 각 전문가는 고유한 전문 분야를 가지며 자문 또는 구현 모두 가능합니다.

| 제공 기능 | 중요한 이유 |
|----------|------------|
| **7명의 도메인 전문가** | 문제 유형에 맞는 적합한 전문가 |
| **3개 AI 프로바이더** | GPT, Gemini, Claude 협업 |
| **듀얼 모드** | 분석(읽기 전용) 또는 구현(쓰기) 가능 |
| **자동 라우팅** | Claude가 언제, 어디로 위임할지 자동 감지 |
| **비용 인식** | Claude(무료) > Gemini(저렴) > GPT(고가) 순 라우팅 |

---

## 전문가 소개

### GPT (Codex CLI) — 아키텍처 & 보안

| 전문가 | 역할 | 트리거 예시 |
|--------|------|------------|
| **Architect** | 시스템 설계, 트레이드오프, 복잡한 디버깅 | "이걸 어떻게 구조화해야 할까?" / "트레이드오프가 뭐야?" |
| **Security Analyst** | 취약점, 위협 모델링 | "이거 안전해?" / "이 엔드포인트 보안 강화해줘" |

### Gemini (CLI) — UI/UX & 프론트엔드

| 전문가 | 역할 | 트리거 예시 |
|--------|------|------------|
| **UI/UX Designer** | 디자인 시스템, 접근성, 시각적 리뷰 | "이 디자인 리뷰해줘" / "접근성 체크해줘" |
| **Frontend Specialist** | React/Vue 최적화, 성능 | "이 컴포넌트 최적화해줘" / "번들 사이즈 줄여줘" |

### Claude (직접 처리) — 코드 품질 & 계획

| 전문가 | 역할 | 트리거 예시 |
|--------|------|------------|
| **Code Reviewer** | 버그 찾기, 품질 개선 | "이 PR 리뷰해줘" / "이거 뭐가 문제야?" |
| **Plan Reviewer** | 시작 전 계획 검증 | "이 마이그레이션 계획 검토해줘" |
| **Scope Analyst** | 초기 모호함 포착 | "내가 뭘 놓치고 있어?" / "범위 명확히 해줘" |

---

## 작동 방식

```
사용자: "이 UI 디자인 리뷰해줘"
                    ↓
Claude: [UI 작업 감지 → Gemini UI/UX Designer 선택]
                    ↓
        ┌─────────────────────────────┐
        │  mcp__gemini__gemini        │
        │  → UI/UX Designer 프롬프트   │
        │  → Gemini가 디자인 분석      │
        └─────────────────────────────┘
                    ↓
Claude: "분석 결과, 3가지 접근성 이슈를 발견했습니다..."
        [응답 종합, 판단 적용]
```

### 프로바이더 라우팅

| 작업 유형 | 프로바이더 | 전문가 |
|----------|-----------|--------|
| 시스템 아키텍처 | GPT | Architect |
| 보안 감사 | GPT | Security Analyst |
| UI/UX 리뷰 | Gemini | UI/UX Designer |
| 프론트엔드 최적화 | Gemini | Frontend Specialist |
| 스크린샷 분석 | Gemini | (vision) |
| 코드 리뷰 | Claude | Code Reviewer |
| 계획 검증 | Claude | Plan Reviewer |
| 범위 명확화 | Claude | Scope Analyst |

---

## 설정

### 작동 모드

모든 전문가는 작업에 따라 두 가지 모드를 지원합니다:

| 모드 | 샌드박스 | 사용 시점 |
|------|---------|----------|
| **Advisory** | `read-only` | 분석, 추천, 리뷰 |
| **Implementation** | `workspace-write` | 변경, 수정 작업 |

### 수동 MCP 설정

`/setup`이 작동하지 않으면 `~/.claude/settings.json`에 직접 추가하세요:

```json
{
  "mcpServers": {
    "codex": {
      "type": "stdio",
      "command": "codex",
      "args": ["-m", "gpt-5.2-codex", "mcp-server"]
    },
    "gemini": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/claude-delegator/mcp-servers/gemini-server/dist/index.js"]
    }
  }
}
```

### 전문가 프롬프트 커스터마이징

전문가 프롬프트는 `prompts/`에 있습니다. 워크플로우에 맞게 수정하세요.

---

## 요구사항

| 프로바이더 | 설치 | 인증 |
|-----------|------|------|
| **GPT** | `npm install -g @openai/codex` | `codex login` |
| **Gemini** | `npm install -g @google/gemini-cli` | `gemini auth login` |
| **Claude** | 내장 | 불필요 |

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/claude-delegator:setup` | MCP 서버 설정 및 규칙 설치 |
| `/claude-delegator:uninstall` | MCP 설정 및 규칙 제거 |

---

## 문제 해결

| 문제 | 해결 방법 |
|------|----------|
| MCP 서버를 찾을 수 없음 | 설정 후 Claude Code 재시작 |
| Codex 인증 안됨 | `codex login` 실행 |
| Gemini 인증 안됨 | `gemini auth login` 실행 |
| 전문가 트리거 안됨 | 명시적으로: "GPT한테 물어봐" 또는 "Gemini로 해줘" |

---

## 개발

```bash
git clone https://github.com/jarrodwatts/claude-delegator
cd claude-delegator

# Gemini MCP 서버 빌드
cd mcp-servers/gemini-server
npm install && npm run build

# 로컬 테스트
claude --plugin-dir /path/to/claude-delegator
```

기여 가이드라인은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참조하세요.

---

## 감사의 말

전문가 프롬프트는 [@code-yeongyu](https://github.com/code-yeongyu)의 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)에서 adapted 되었습니다.

---

## 라이선스

MIT — [LICENSE](LICENSE) 참조

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jarrodwatts/claude-delegator&type=Date&v=2)](https://star-history.com/#jarrodwatts/claude-delegator&Date)
