# Orchestrator Prompt Alignment with Codegen Architecture

## Версия: 1.0.0
## Дата: 2025-01-08
## Статус: Analysis & Recommendations

---

## 🎯 Цель документа

Проанализировать текущий системный промпт оркестратора (`packages/edge-worker/prompts/orchestrator.md`) и определить, какие изменения необходимы для поддержки Codegen-only архитектуры.

---

## 📋 Анализ текущего промпта

### Что работает хорошо и остаётся без изменений:

✅ **Core Responsibilities** (строки 5-10)
- Analyze, Delegate, Evaluate, Iterate - всё актуально
- Не зависит от executor'а

✅ **Sub-Issue Design Principles** (строки 125-143)
- Atomic & Independent, Right-Sized, Context-Rich
- Универсальны для любого executor'а

✅ **Verification Requirements** (строки 42-50, 72-201)
- Mandatory verification process
- Verification techniques (automated, interactive, manual)
- Verification failure recovery
- **Критично важно:** Эти правила работают независимо от того, кто выполняет задачу

✅ **State Management** (строки 202-227)
- Orchestration status tracking
- Verification log format
- Key decisions and risks
- Полностью актуально

✅ **Error Recovery** (строки 229-238)
- Логика обработки ошибок
- Не зависит от executor'а

---

## 🔄 Что нужно обновить для Codegen

### 1. **Required Tools** (строки 12-22) - ОБНОВИТЬ

**Текущая версия:**
```markdown
### Linear MCP Tools
- mcp__linear__linear_createIssue
- mcp__linear__linear_getIssueById

### Cyrus MCP Tools
- mcp__cyrus-tools__linear_agent_session_create
- mcp__cyrus-tools__linear_agent_session_create_on_comment
- mcp__cyrus-tools__linear_agent_give_feedback
```

**Проблема:** 
- `mcp__cyrus-tools__*` инструменты созданы для локальной архитектуры
- При Codegen-only нужны адаптированные инструменты

**Рекомендация:**
```markdown
### Required Tools

#### Linear MCP Tools (Provided by Codegen)
- `mcp__linear__linear_createIssue` - Create sub-issues with proper context
- `mcp__linear__linear_getIssueById` - Retrieve issue details
- `mcp__linear__linear_updateIssue` - Update issue status and details
- `mcp__linear__linear_commentOnIssue` - Post comments to Linear issues

#### Codegen Integration Tools (New)
- `mcp__codegen__create_agent_session` - Create Codegen agent session for sub-issue
- `mcp__codegen__get_session_status` - Check status of Codegen agent session
- `mcp__codegen__get_session_result` - Retrieve results from completed session
- `mcp__codegen__provide_feedback` - Provide feedback to Codegen agent session

#### Git Tools (Built-in)
- Bash tool for git operations (merge, push, status)
```

### 2. **Execution Workflow** (строки 60-68) - ОБНОВИТЬ

**Текущая версия:**
```markdown
### 2. Execute
1. Start first sub-issue by triggering a new working session:
   - For issues: Use mcp__cyrus-tools__linear_agent_session_create with issueId
   - For root comment threads: Use mcp__cyrus-tools__linear_agent_session_create_on_comment
   This creates a sub-agent session that will process the work independently
2. HALT and await completion notification
3. Upon completion, evaluate results
```

**Рекомендация:**
```markdown
### 2. Execute
1. Start first sub-issue by creating Codegen agent session:
   ```
   Use mcp__codegen__create_agent_session with:
   - issueId: Linear issue ID to work on
   - repositoryId: Repository to use
   - taskType: 'debugger', 'builder', 'scoper' (determines agent prompt)
   - context: {
       parentIssueId: Parent issue for context
       verificationRequirements: Specific verification commands expected
       acceptanceCriteria: What defines success
     }
   ```
   This creates a Codegen agent session that will:
   - Clone/access the repository worktree
   - Execute work according to assigned agent type
   - Provide verification instructions upon completion
   - Post progress updates to Linear

2. HALT and monitor session status:
   - Session runs asynchronously on Codegen infrastructure
   - You can check status with: mcp__codegen__get_session_status
   - Wait for completion notification via webhook or polling

3. Upon completion, retrieve and evaluate results:
   - Use mcp__codegen__get_session_result to get:
     - Verification instructions provided by child agent
     - Working directory path
     - Changes made (commits, branch name)
     - Agent's completion report
```

### 3. **Verification Process** (строки 72-123) - ЧАСТИЧНО ОБНОВИТЬ

**Текущий текст говорит:**
```markdown
1. Navigate to Child Worktree: cd /path/to/child-worktree (get path from agent session)
2. Execute Verification Commands: Run all commands provided by the child agent
```

**Проблема с Codegen:**
- Codegen sessions могут работать в изолированных контейнерах
- Worktree path может быть недоступен напрямую с вашего оркестратора

**Два варианта решения:**

**Вариант А: Shared Filesystem (если возможно)**
```markdown
1. **Navigate to Child Worktree**: 
   ```bash
   cd /path/to/shared/worktrees/{{ session-id }}
   # Path provided by Codegen session metadata
   ```

2. **Execute Verification Commands**: Run all commands provided by the child agent
   ```bash
   # Example verification flow:
   npm test                    # Run tests
   npm run build               # Build project
   npm run typecheck           # Type checking
   ```
```

**Вариант Б: Remote Verification via Codegen (рекомендуется для cloud)**
```markdown
1. **Request Verification Execution via Codegen**:
   Instead of navigating to worktree locally, create a new verification session:
   ```
   Use mcp__codegen__create_verification_session with:
   - sessionId: Original child session ID
   - verificationCommands: Commands to run (from child agent's instructions)
   ```
   
   This will:
   - Execute verification commands in the same environment as the child agent
   - Return results (exit codes, stdout, stderr, screenshots)
   - Preserve isolation and security

2. **Review Verification Results**:
   - Parse verification output
   - Compare against expected outcomes from child agent
   - Make merge decision based on verification success
```

**Рекомендация:** Начать с **Вариант Б** для Codegen-only архитектуры, потому что:
- ✅ Не требует shared filesystem
- ✅ Проще для cloud deployment
- ✅ Безопаснее (isolation)
- ✅ Консистентное окружение (та же среда, что у child agent)

Позже можно добавить **Вариант А** для локальной разработки/оптимизации.

### 4. **Model Selection Label** (строка 53-55) - ОБНОВИТЬ

**Текущая версия:**
```markdown
- **Model Selection Label**:
  - `sonnet` → Include this label if you believe the issue is relatively simple
```

**Проблема:**
- Слишком упрощённая модель выбора
- Codegen поддерживает множество моделей

**Рекомендация:**
```markdown
- **Model Selection Label** (optional):
  - `sonnet` → Claude 3.5 Sonnet (default, balanced)
  - `opus` → Claude 3 Opus (complex tasks, highest quality)
  - `haiku` → Claude 3 Haiku (simple tasks, fastest)
  - `gpt-4` → GPT-4 (alternative reasoning)
  - `gemini-pro` → Gemini Pro (multimodal tasks)
  
  If no label provided, Codegen will auto-select based on task complexity.
```

### 5. **Конфигурация и Context** - ДОБАВИТЬ

**Что отсутствует в текущем промпте:**
- Как Codegen получает доступ к репозиторию?
- Как настраиваются credentials (Linear, GitHub tokens)?
- Как передаётся контекст родительской задачи?

**Рекомендация добавить секцию:**

```markdown
## Codegen Session Configuration

When creating a Codegen agent session, the following context is automatically provided:

### Repository Access
- **Worktree Path**: Isolated directory for this sub-issue
- **Git Branch**: Automatically created from parent branch
- **Repository Credentials**: Inherited from parent session

### Linear Integration
- **Linear Token**: Provided via MCP server configuration
- **Issue Context**: Full issue details, comments, attachments
- **Parent Issue Link**: Maintains relationship for context

### MCP Servers Available to Child Agent
- **Linear MCP**: For querying issues, posting comments
- **GitHub MCP**: For PR operations, code search
- **Custom MCPs**: Repository-specific MCP servers (if configured)

### Agent Role Selection
Child agent's system prompt is selected based on task type:
- `Bug` label → Debugger agent prompt
- `Feature`/`Improvement` label → Builder agent prompt  
- `PRD` label → Scoper agent prompt
- Parent issue → Orchestrator agent prompt (recursion if complex)

### Cost Tracking
- Each Codegen session tracks its own cost
- Cost is reported in completion result
- Orchestrator should aggregate costs for parent issue
```

---

## 📝 Необходимые MCP Tools для Codegen

Для работы оркестратора с Codegen нужны следующие MCP tools:

### Новые инструменты (нужно разработать):

```typescript
// packages/codegen-mcp/src/tools/

/**
 * Create a new Codegen agent session for a sub-issue
 */
interface CreateAgentSessionTool {
  name: 'mcp__codegen__create_agent_session';
  parameters: {
    issueId: string;              // Linear issue ID
    repositoryId: string;         // Repository ID from config
    taskType: 'orchestrator' | 'builder' | 'debugger' | 'scoper';
    context: {
      parentIssueId?: string;     // Parent issue for context
      verificationRequirements?: string; // Specific verification expected
      acceptanceCriteria?: string[];    // What defines success
      customPrompt?: string;            // Optional prompt override
    };
    modelConfig?: {
      model?: string;               // Explicit model selection
      maxCost?: number;             // Cost limit for this session
    };
  };
  returns: {
    sessionId: string;              // Codegen session ID
    workspacePath: string;          // Path to worktree (if accessible)
    status: 'created' | 'starting';
    estimatedCost: number;          // Estimated cost
  };
}

/**
 * Check status of a Codegen agent session
 */
interface GetSessionStatusTool {
  name: 'mcp__codegen__get_session_status';
  parameters: {
    sessionId: string;
  };
  returns: {
    status: 'running' | 'completed' | 'failed' | 'timeout';
    progress?: string;              // Current activity description
    cost: number;                   // Cost so far
    duration: number;               // Seconds elapsed
    lastUpdate: string;             // ISO timestamp
  };
}

/**
 * Retrieve results from completed session
 */
interface GetSessionResultTool {
  name: 'mcp__codegen__get_session_result';
  parameters: {
    sessionId: string;
  };
  returns: {
    status: 'completed' | 'failed';
    
    // Verification instructions from child agent
    verificationInstructions: {
      commands: string[];           // Commands to run
      expectedOutcomes: string[];   // What success looks like
      workingDirectory: string;     // Where to run commands
      visualEvidence?: string[];    // Screenshots/artifacts to check
    };
    
    // Git changes
    changes: {
      branch: string;               // Branch with changes
      commits: string[];            // Commit SHAs
      filesChanged: number;         // File count
    };
    
    // Completion report
    report: {
      summary: string;              // What was done
      challenges: string[];         // Issues encountered
      decisions: string[];          // Key decisions made
      nextSteps?: string[];         // Suggested follow-ups
    };
    
    // Metadata
    cost: number;                   // Total cost
    duration: number;               // Total seconds
    modelUsed: string;              // Which model
  };
}

/**
 * Execute verification in Codegen environment (remote verification)
 */
interface ExecuteVerificationTool {
  name: 'mcp__codegen__execute_verification';
  parameters: {
    sessionId: string;              // Original session ID
    commands: string[];             // Commands to execute
    workingDirectory?: string;      // Override working dir
    captureScreenshots?: boolean;   // For UI verification
  };
  returns: {
    results: Array<{
      command: string;
      exitCode: number;
      stdout: string;
      stderr: string;
      duration: number;
    }>;
    screenshots?: Array<{
      url: string;
      description: string;
    }>;
    overallSuccess: boolean;
  };
}

/**
 * Provide feedback to child agent (for iteration)
 */
interface ProvideFeedbackTool {
  name: 'mcp__codegen__provide_feedback';
  parameters: {
    sessionId: string;
    feedback: {
      type: 'success' | 'partial' | 'failed';
      message: string;              // Detailed feedback
      verificationResults?: any;    // Verification output
      requiredChanges?: string[];   // What needs fixing
    };
  };
  returns: {
    acknowledged: boolean;
    nextAction: 'retry' | 'escalate' | 'complete';
  };
}
```

---

## 🔄 Обновлённый Execution Workflow (полная версия)

```markdown
### 2. Execute Sub-Issue via Codegen

#### Step 1: Create Codegen Agent Session

Use `mcp__codegen__create_agent_session`:
```json
{
  "issueId": "LIN-123",
  "repositoryId": "main-repo",
  "taskType": "builder",
  "context": {
    "parentIssueId": "LIN-100",
    "verificationRequirements": "Run npm test, npm run build, and take screenshot of UI at localhost:3000 showing the new dashboard",
    "acceptanceCriteria": [
      "All tests pass",
      "Build succeeds without errors",
      "Dashboard renders correctly with new widget"
    ]
  }
}
```

Returns:
```json
{
  "sessionId": "codegen-sess-abc123",
  "workspacePath": "/codegen/workspaces/sess-abc123",
  "status": "starting",
  "estimatedCost": 0.50
}
```

#### Step 2: Monitor Session Progress

Poll status periodically with `mcp__codegen__get_session_status`:
```json
{
  "sessionId": "codegen-sess-abc123"
}
```

Returns:
```json
{
  "status": "running",
  "progress": "Implementing dashboard widget component",
  "cost": 0.32,
  "duration": 180,
  "lastUpdate": "2025-01-08T10:30:00Z"
}
```

**HALT here** and wait for completion (either via webhook or polling).

#### Step 3: Retrieve Results

Once status is "completed", use `mcp__codegen__get_session_result`:
```json
{
  "sessionId": "codegen-sess-abc123"
}
```

Returns:
```json
{
  "status": "completed",
  "verificationInstructions": {
    "commands": [
      "npm test",
      "npm run build",
      "npm run dev & sleep 5 && playwright screenshot http://localhost:3000 dashboard.png"
    ],
    "expectedOutcomes": [
      "All 47 tests pass",
      "Build completes in <30s with no errors",
      "Screenshot shows dashboard with new metrics widget in top-right"
    ],
    "workingDirectory": "/codegen/workspaces/sess-abc123/my-repo",
    "visualEvidence": ["dashboard.png"]
  },
  "changes": {
    "branch": "cyrus/LIN-123-add-dashboard-widget",
    "commits": ["a1b2c3d", "e4f5g6h"],
    "filesChanged": 5
  },
  "report": {
    "summary": "Added metrics dashboard widget component with real-time data fetching",
    "challenges": [
      "Had to refactor Chart.js integration for better performance"
    ],
    "decisions": [
      "Used React.memo to prevent unnecessary re-renders",
      "Implemented polling with 5s interval instead of WebSocket"
    ]
  },
  "cost": 0.45,
  "duration": 420,
  "modelUsed": "claude-3-5-sonnet"
}
```

#### Step 4: Execute Verification

**Option A: Remote Verification (Recommended for Codegen-only)**

Use `mcp__codegen__execute_verification`:
```json
{
  "sessionId": "codegen-sess-abc123",
  "commands": [
    "npm test",
    "npm run build",
    "npm run dev & sleep 5 && playwright screenshot http://localhost:3000 dashboard.png"
  ],
  "captureScreenshots": true
}
```

Returns:
```json
{
  "results": [
    {
      "command": "npm test",
      "exitCode": 0,
      "stdout": "47 tests passed",
      "stderr": "",
      "duration": 12
    },
    {
      "command": "npm run build",
      "exitCode": 0,
      "stdout": "Build completed successfully in 28s",
      "stderr": "",
      "duration": 28
    },
    {
      "command": "playwright screenshot ...",
      "exitCode": 0,
      "stdout": "Screenshot saved to dashboard.png",
      "stderr": "",
      "duration": 8
    }
  ],
  "screenshots": [
    {
      "url": "https://codegen.com/sessions/abc123/artifacts/dashboard.png",
      "description": "Dashboard with new metrics widget"
    }
  ],
  "overallSuccess": true
}
```

**Option B: Local Verification** (if shared filesystem available)

Navigate to worktree and run commands locally:
```bash
cd /codegen/workspaces/sess-abc123/my-repo
npm test
npm run build
npm run dev & sleep 5 && playwright screenshot http://localhost:3000 dashboard.png
```

#### Step 5: Evaluate and Decide

**If verification passes:**
```bash
# Merge child branch into parent
git fetch origin cyrus/LIN-123-add-dashboard-widget
git merge origin/cyrus/LIN-123-add-dashboard-widget --no-ff

# Push to remote
git push origin <current-parent-branch>

# Update Linear issue
mcp__linear__linear_updateIssue({
  "issueId": "LIN-123",
  "stateId": "completed-state-id"
})

# Post verification results as comment
mcp__linear__linear_commentOnIssue({
  "issueId": "LIN-123",
  "body": "✅ Verification passed:\\n- Tests: 47/47 passed\\n- Build: Success in 28s\\n- UI: Dashboard renders correctly ([screenshot](...))"
})

# Start next sub-issue
```

**If verification fails:**
```typescript
// Provide feedback to child agent
mcp__codegen__provide_feedback({
  sessionId: "codegen-sess-abc123",
  feedback: {
    type: "failed",
    message: "Verification failed: Tests pass but UI screenshot shows widget is misaligned",
    verificationResults: { ... },
    requiredChanges: [
      "Fix widget alignment - should be flush with right edge",
      "Ensure responsive layout for mobile"
    ]
  }
})

// DO NOT merge
// Wait for child agent to fix and re-verify
```
```

---

## 🎯 Обновлённый Checklist для Sub-Issue Creation

```markdown
## Sub-Issue Creation Checklist (Codegen-Adapted)

When creating a sub-issue, verify:
- [ ] Agent type label added (`Bug`, `Feature`, `Improvement`, or `PRD`)
- [ ] Model selection label evaluated (optional: `sonnet`, `opus`, `haiku`, `gpt-4`, `gemini-pro`)
- [ ] **Parent assignee inherited** (`assigneeId` parameter set to parent's assignee)
- [ ] Clear objective defined
- [ ] Acceptance criteria specified
- [ ] All necessary context included
- [ ] Dependencies identified
- [ ] **Mandatory verification requirements included** with specific commands
- [ ] **Expected verification outcomes documented** (what success looks like)
- [ ] **Cost estimate** (optional: add maxCost if budget-sensitive)

Example sub-issue description with Codegen context:
```markdown
Objective: Add metrics dashboard widget to main dashboard

Context: Parent issue LIN-100 requires new dashboard UI. This sub-issue implements the widget component.

Acceptance Criteria:
- [ ] Widget displays metrics: active users, revenue, conversion rate
- [ ] Real-time updates every 5 seconds
- [ ] Responsive design (works on mobile)
- [ ] No performance regression (< 100ms render time)

Dependencies: 
- Metrics API endpoint (LIN-122) must be completed first

Technical Notes:
- Use React.memo for performance
- Charts library: Chart.js (already in project)
- Place in src/components/Dashboard/MetricsWidget.tsx

**MANDATORY VERIFICATION REQUIREMENTS:**

Upon completion, provide these verification instructions:

1. **Verification Commands**:
   ```bash
   npm test                              # Run all tests
   npm run build                         # Ensure build works
   npm run dev                           # Start dev server
   # Wait for server, then:
   playwright screenshot http://localhost:3000 dashboard.png
   ```

2. **Expected Outcomes**:
   - All tests pass (including new MetricsWidget.test.tsx)
   - Build completes without errors
   - Screenshot shows widget in top-right of dashboard with three metrics displayed

3. **Verification Context**:
   - Working directory: Repository root
   - Dev server port: 3000
   - Screenshot should show desktop view (1920x1080)

4. **Visual Evidence**:
   - Take screenshot of dashboard showing new widget
   - Widget should display: "Active Users: 1,234", "Revenue: $45,678", "Conversion: 3.2%"

The parent orchestrator will execute these verification steps via Codegen's verification tool.
```
```

---

## 🚀 Implementation Plan

### Phase 1: MCP Tools Development (Week 1-2)

**Задачи:**
1. Создать пакет `packages/codegen-mcp` (новый)
2. Реализовать 5 новых MCP tools:
   - `create_agent_session`
   - `get_session_status`
   - `get_session_result`
   - `execute_verification`
   - `provide_feedback`
3. Интеграция с Codegen API/SDK
4. Тесты для каждого tool

**Deliverable:** Работающие MCP tools для Codegen

### Phase 2: Orchestrator Prompt Update (Week 2)

**Задачи:**
1. Обновить `packages/edge-worker/prompts/orchestrator.md`:
   - Секция "Required Tools"
   - Секция "Execution Workflow"
   - Добавить "Codegen Session Configuration"
   - Обновить чеклисты
2. Добавить примеры использования Codegen tools
3. Review и validation

**Deliverable:** Обновлённый orchestrator prompt

### Phase 3: Integration Testing (Week 3)

**Задачи:**
1. End-to-end тест: Orchestrator создаёт sub-issue → Codegen выполняет → Verification → Merge
2. Тестирование всех сценариев:
   - Success path (всё работает)
   - Verification failure (нужен retry)
   - Session timeout
   - Cost limit exceeded
3. Документация

**Deliverable:** Протестированная интеграция

### Phase 4: Documentation (Week 3-4)

**Задачи:**
1. User guide: Как настроить Codegen для Cyrus
2. Developer guide: Как работают Codegen MCP tools
3. Troubleshooting guide
4. Migration guide (если были legacy agents)

**Deliverable:** Полная документация

---

## ✅ Выводы

### Что нужно сделать:

1. **Разработать новые MCP tools** для Codegen (`packages/codegen-mcp`)
   - 5 основных инструментов (см. выше)
   - Интеграция с Codegen API

2. **Обновить orchestrator prompt** (`packages/edge-worker/prompts/orchestrator.md`)
   - Секция "Required Tools" - заменить Cyrus tools на Codegen tools
   - Секция "Execution Workflow" - добавить Codegen-specific steps
   - Новая секция "Codegen Session Configuration"
   - Обновить чеклисты и примеры

3. **Обновить EdgeWorker** для работы с Codegen MCP tools
   - Вместо локальных session create использовать Codegen API
   - Webhook handling для Codegen completion notifications
   - Cost tracking integration

4. **Тестирование** полного E2E flow

### Что остаётся без изменений:

- ✅ Core responsibilities orchestrator'а
- ✅ Sub-issue design principles  
- ✅ Verification requirements и techniques
- ✅ State management и tracking
- ✅ Error recovery logic

### Временная оценка:

- Phase 1 (MCP Tools): 1-2 недели
- Phase 2 (Prompt Update): 3-5 дней
- Phase 3 (Integration Testing): 1 неделя
- Phase 4 (Documentation): 3-5 дней

**Total: ~3-4 недели** для полной адаптации orchestrator'а под Codegen

---

**Дата:** 2025-01-08  
**Версия:** 1.0.0  
**Статус:** Analysis Complete - Ready for Implementation
