# Архитектурные диаграммы: Интеграция Codegen в Cyrus

## 1. Текущая архитектура (AS-IS)

```
┌─────────────────────────────────────────────────────────────────┐
│                          Linear Workspace                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  Issue   │  │  Issue   │  │  Issue   │                      │
│  │ assigned │  │ assigned │  │ assigned │                      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                      │
└───────┼─────────────┼─────────────┼────────────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │
                   Webhook
                      │
                      ▼
        ┌─────────────────────────┐
        │   Cloudflare Worker     │
        │   (proxy-worker)        │
        │  • OAuth handling       │
        │  • Webhook routing      │
        │  • Event streaming      │
        └────────────┬────────────┘
                     │
                  NDJSON
                  Stream
                     │
                     ▼
        ┌─────────────────────────┐
        │      EdgeWorker         │
        │  • Session management   │
        │  • Procedure routing    │
        │  • Workspace creation   │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐       ┌───────────────┐
│ ClaudeRunner  │       │ ClaudeRunner  │
│  (Issue 1)    │       │  (Issue 2)    │
└───────┬───────┘       └───────┬───────┘
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Claude Code   │       │ Claude Code   │
│ SDK (Local)   │       │ SDK (Local)   │
└───────┬───────┘       └───────┬───────┘
        │                       │
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Git Worktree  │       │ Git Worktree  │
│ (Issue 1)     │       │ (Issue 2)     │
└───────┬───────┘       └───────┬───────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
            ┌───────────────┐
            │  Main Repo    │
            │  (Local FS)   │
            └───────────────┘

Ограничения:
• Последовательное выполнение (один issue за раз на машину)
• Привязка к локальной файловой системе
• Требует настройки окружения пользователем
• Ограничено ресурсами одной машины
```

---

## 2. Целевая архитектура с Codegen (TO-BE)

```
┌─────────────────────────────────────────────────────────────────┐
│                          Linear Workspace                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Issue   │  │  Issue   │  │  Issue   │  │  Issue   │       │
│  │ assigned │  │ assigned │  │ assigned │  │ assigned │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼──────────────┼─────────────┘
        │             │             │              │
        └─────────────┴─────────────┴──────────────┘
                      │
                   Webhook
                      │
                      ▼
        ┌─────────────────────────┐
        │   Cloudflare Worker     │
        │   (proxy-worker)        │
        │  • OAuth handling       │
        │  • Webhook routing      │
        │  • Event streaming      │
        └────────────┬────────────┘
                     │
                  NDJSON
                  Stream
                     │
                     ▼
        ┌─────────────────────────────────────────┐
        │           EdgeWorker                    │
        │  • Session management                   │
        │  • Task orchestration                   │
        │  • Executor selection                   │
        └────────────┬────────────────────────────┘
                     │
                     ▼
        ┌─────────────────────────┐
        │    TaskOrchestrator     │
        │  • Analyze task         │
        │  • Select executor      │
        │  • Monitor execution    │
        └────────────┬────────────┘
                     │
        ┌────────────┴─────────────┐
        │                          │
        ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐
│  Local Executor  │    │   Cloud Executor     │
│  (ClaudeRunner)  │    │  (CodegenExecutor)   │
│                  │    │                      │
│  • Orchestration │    │  • Feature impl      │
│  • Analysis      │    │  • Bug fixes         │
│  • Validation    │    │  • Testing           │
│  • Quick checks  │    │  • PR creation       │
└────────┬─────────┘    └────────┬─────────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────────┐
│  Claude Code SDK │    │   Codegen API        │
│   (Local)        │    │   (Cloud)            │
└────────┬─────────┘    └────────┬─────────────┘
         │                       │
         ▼                       │
┌──────────────────┐             │
│  Git Worktree    │             │
│  (Local FS)      │             │
└──────────────────┘             │
                                 ▼
                    ┌────────────────────────┐
                    │  Codegen Sandboxes     │
                    │  ┌──────┐  ┌──────┐   │
                    │  │Task 1│  │Task 2│   │
                    │  │Isolated Isolated│   │
                    │  └──────┘  └──────┘   │
                    │  ┌──────┐  ┌──────┐   │
                    │  │Task 3│  │Task 4│   │
                    │  │Isolated Isolated│   │
                    │  └──────┘  └──────┘   │
                    │  • SOC 2 compliant    │
                    │  • Full context       │
                    │  • Parallel exec      │
                    └────────────────────────┘

Преимущества:
✅ Параллельное выполнение (unlimited tasks в облаке)
✅ Изолированные sandboxes (SOC 2 compliant)
✅ Managed infrastructure (Codegen)
✅ Гибкий выбор executor'а (local vs cloud)
✅ Масштабируемость без ограничений
```

---

## 3. Executor Interface (унифицированная абстракция)

```
┌─────────────────────────────────────────────────────────────────┐
│                       TaskExecutor Interface                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  execute(prompt, context): Promise<ExecutionResult>             │
│  executeStreaming(prompt, context, onProgress)                  │
│  isRunning(): boolean                                            │
│  stop(): Promise<void>                                           │
│  getStatus(sessionId): Promise<ExecutionStatus>                 │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
           ┌───────────────┴────────────────┐
           │                                │
           ▼                                ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│  ClaudeExecutorAdapter  │    │   CodegenExecutor        │
├─────────────────────────┤    ├──────────────────────────┤
│                         │    │                          │
│ Wraps ClaudeRunner      │    │ Wraps Codegen SDK        │
│ Implements interface    │    │ Implements interface     │
│                         │    │                          │
│ • Local execution       │    │ • Cloud execution        │
│ • Git worktrees         │    │ • Isolated sandboxes     │
│ • Streaming support     │    │ • Polling for status     │
│ • Full SDK features     │    │ • PR creation            │
└─────────────────────────┘    └──────────────────────────┘

Преимущества абстракции:
• Единый интерфейс для всех executor'ов
• Простое добавление новых executor'ов
• Лёгкое тестирование (mock interface)
• Decoupling от конкретных реализаций
```

---

## 4. Task Orchestration Flow (hybrid-smart стратегия)

```
┌──────────────────────────────────────────────────────────────────┐
│                     Linear Issue Assigned                         │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │  EdgeWorker receives event  │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │  Create task from issue     │
            │  • Extract metadata         │
            │  • Analyze complexity       │
            │  • Estimate cost            │
            └─────────────┬───────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   TaskOrchestrator          │
            │   .selectExecutor(task)     │
            └─────────────┬───────────────┘
                          │
          ┌───────────────┴────────────────┐
          │                                │
    Task Type?                       Task Type?
          │                                │
    Orchestrator                     Builder/Debugger
    Analysis                         Implementation
    Validation                       Testing
          │                                │
          ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐
│   Local Executor     │      │   Cloud Executor     │
│   (ClaudeRunner)     │      │   (CodegenExecutor)  │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           ▼                             ▼
┌──────────────────────┐      ┌──────────────────────┐
│ Execute locally      │      │ Call Codegen API     │
│ • Fast              │      │ • Isolated sandbox   │
│ • Full control      │      │ • Parallel capable   │
│ • No network        │      │ • Managed infra      │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           │                             ▼
           │              ┌──────────────────────────┐
           │              │ Poll for completion      │
           │              │ • Get status            │
           │              │ • Stream events         │
           │              │ • Handle errors         │
           │              └──────────┬───────────────┘
           │                         │
           └────────────┬────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │  Aggregate results          │
          │  • Parse output             │
          │  • Extract PR links         │
          │  • Collect metrics          │
          └─────────────┬───────────────┘
                        │
                        ▼
          ┌─────────────────────────────┐
          │  Post to Linear             │
          │  • Success/failure comment  │
          │  • Update issue state       │
          │  • Link PR if created       │
          └─────────────────────────────┘
```

---

## 5. Decision Tree: Executor Selection

```
                    ┌─────────────────┐
                    │   New Task      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Strategy Mode?  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
  local-only          cloud-only           hybrid-smart
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
│ Use Local    │   │ Use Cloud    │   │ Analyze Task     │
│ (Claude)     │   │ (Codegen)    │   │                  │
└──────────────┘   └──────────────┘   └────────┬─────────┘
                                                │
                        ┌───────────────────────┴──────────────────┐
                        │                                           │
                        ▼                                           ▼
              ┌──────────────────┐                        ┌──────────────────┐
              │ Task Type?       │                        │ Complexity?      │
              └────────┬─────────┘                        └────────┬─────────┘
                       │                                           │
        ┌──────────────┼────────────────┐              ┌──────────┼──────────┐
        │              │                │              │          │          │
        ▼              ▼                ▼              ▼          ▼          ▼
  Orchestrator    Builder         Debugger          Low       Medium      High
        │              │                │              │          │          │
        ▼              ▼                ▼              ▼          ▼          ▼
   ┌────────┐    ┌─────────┐     ┌─────────┐    ┌────────┐ ┌────────┐ ┌────────┐
   │ Local  │    │  Cloud  │     │  Cloud  │    │ Local  │ │ Local  │ │ Cloud  │
   │        │    │         │     │         │    │        │ │or Cloud│ │        │
   └────────┘    └─────────┘     └─────────┘    └────────┘ └────────┘ └────────┘

Additional factors considered:
• Requires isolation? → Cloud
• Requires parallel? → Cloud
• Time sensitive? → Consider cost
• Cost limit reached? → Local fallback
• Cloud unavailable? → Local fallback
```

---

## 6. Data Flow: Hybrid Execution

```
┌────────────────────────────────────────────────────────────────────┐
│                    Complex Feature Request                          │
│                    (Linear Issue with sub-tasks)                    │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                    LOCAL: Orchestrator Analysis                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ClaudeRunner (Local)                                      │  │
│  │  • Analyze parent issue                                    │  │
│  │  • Break into sub-tasks:                                   │  │
│  │    - Task 1: Implement API endpoint                        │  │
│  │    - Task 2: Create UI component                           │  │
│  │    - Task 3: Write tests                                   │  │
│  │  • Estimate complexity and cost                            │  │
│  │  • Create Linear sub-issues                                │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│              CLOUD: Parallel Task Execution                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CodegenExecutor → Task 1 (Sandbox 1)                    │   │
│  │  • git clone repo                                         │   │
│  │  • checkout base branch                                   │   │
│  │  • implement API endpoint                                 │   │
│  │  • run tests                                              │   │
│  │  • create PR                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CodegenExecutor → Task 2 (Sandbox 2)                    │   │
│  │  • git clone repo                                         │   │
│  │  • checkout base branch                                   │   │
│  │  • create UI component                                    │   │
│  │  • run tests                                              │   │
│  │  • create PR                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CodegenExecutor → Task 3 (Sandbox 3)                    │   │
│  │  • git clone repo                                         │   │
│  │  • checkout base branch + Task 1 & 2 branches             │   │
│  │  • write integration tests                                │   │
│  │  • run test suite                                         │   │
│  │  • create PR                                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬─────────────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────┐
│                  LOCAL: Validation & Merge                        │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  ClaudeRunner (Local)                                      │  │
│  │  • Review all PRs                                          │  │
│  │  • Check test results                                      │  │
│  │  • Validate acceptance criteria                           │  │
│  │  • Merge PRs in order                                      │  │
│  │  • Update parent issue                                     │  │
│  │  • Post summary to Linear                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

Timeline comparison:
Sequential (current): Task 1 (30m) → Task 2 (30m) → Task 3 (20m) = 80m
Parallel (with Codegen): max(30m, 30m, 20m) + overhead (10m) = 40m
Speed improvement: 2x faster
```

---

## 7. Cost Optimization Flow

```
                  ┌────────────────────┐
                  │   New Task         │
                  └─────────┬──────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │ Estimate Task Cost      │
              │ • Complexity analysis   │
              │ • Historical data       │
              │ • Token estimation      │
              └─────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────────┐
        │       Cost Calculation            │
        │                                   │
        │  Local Cost = $0 (Claude Pro)    │
        │  Cloud Cost = Estimated tokens × │
        │               price_per_token     │
        └───────────┬───────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────┐
        │   Check Cost Limits               │
        │   • maxCostPerTask?               │
        │   • Daily budget remaining?       │
        └───────────┬───────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
        ▼                        ▼
   Cost OK?                  Limit exceeded?
        │                        │
        ▼                        ▼
┌──────────────┐      ┌──────────────────┐
│ Evaluate ROI │      │ Fallback to      │
│              │      │ Local Executor   │
└──────┬───────┘      └──────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ ROI Analysis                     │
│                                  │
│ Cloud Benefits:                  │
│  + Faster execution (parallel)   │
│  + Better isolation              │
│  + No local resource usage       │
│                                  │
│ Local Benefits:                  │
│  + Zero incremental cost         │
│  + Full control                  │
│  + No network dependency         │
└──────────┬───────────────────────┘
           │
           ▼
  ┌────────────────────┐
  │  Select Executor   │
  │  • Cloud if worth  │
  │  • Local otherwise │
  └────────────────────┘

Cost tracking:
• Per-task cost recorded
• Daily/weekly/monthly aggregates
• Alerts when approaching limits
• Cost attribution by project/team
```

---

## 8. Error Handling & Fallback

```
                    ┌────────────────────┐
                    │  Execute Task      │
                    │  (Primary: Cloud)  │
                    └─────────┬──────────┘
                              │
                              ▼
                  ┌───────────────────────┐
                  │   Codegen API call    │
                  └─────────┬─────────────┘
                            │
        ┌───────────────────┼──────────────────┐
        │                   │                  │
        ▼                   ▼                  ▼
   Success?          API Error?          Timeout?
        │                   │                  │
        ▼                   ▼                  ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│ Return       │  │ Retry Logic      │  │ Abort &      │
│ Result       │  │ • Exponential    │  │ Fallback     │
│              │  │   backoff        │  │              │
└──────────────┘  │ • Max 3 retries  │  └──────┬───────┘
                  └─────────┬────────┘         │
                            │                  │
                            ▼                  │
                    Still failing?             │
                            │                  │
                            └──────────┬───────┘
                                       │
                                       ▼
                        ┌──────────────────────────┐
                        │  Fallback Decision       │
                        │  • Task critical?        │
                        │  • Local capable?        │
                        │  • User preference?      │
                        └──────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐        ┌────────────────────┐
        │ Fallback to Local  │        │ Report Failure     │
        │ (ClaudeRunner)     │        │ • Notify user      │
        │                    │        │ • Log error        │
        │ + Try locally      │        │ • Queue for retry  │
        │ + Post to Linear   │        └────────────────────┘
        │ + Log fallback     │
        └────────────────────┘

Error categories:
1. Network errors → Retry then fallback
2. API errors (4xx) → Log and report
3. Timeout → Fallback to local
4. Cost limit exceeded → Use local
5. Sandbox failure → Retry with new sandbox
```

---

## 9. Configuration & Setup Flow

```
┌────────────────────────────────────────────────────────────────┐
│                    Initial Setup: cyrus                         │
└─────────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────┐
              │  Check existing config    │
              │  ~/.cyrus/config.json     │
              └───────────┬───────────────┘
                          │
          ┌───────────────┴────────────────┐
          │                                │
   Config exists?                    First run?
          │                                │
          ▼                                ▼
┌──────────────────┐          ┌─────────────────────┐
│ Load & validate  │          │ Setup wizard        │
│ existing config  │          │ • Linear OAuth      │
└────────┬─────────┘          │ • Repository path   │
         │                    │ • Base branch       │
         │                    │ • Allowed tools     │
         │                    └──────────┬──────────┘
         │                               │
         └───────────┬───────────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Codegen configuration?      │
      │  "Would you like to enable   │
      │   cloud execution?"          │
      └──────────────┬───────────────┘
                     │
         ┌───────────┴────────────┐
         │                        │
         ▼                        ▼
    Yes, enable             No, local only
         │                        │
         ▼                        ▼
┌─────────────────────┐   ┌──────────────┐
│ Codegen setup       │   │ Skip Codegen │
│ • Org ID            │   │ config       │
│ • API token         │   │              │
│ • Strategy select   │   │ Use local    │
│ • Cost limits       │   │ execution    │
└─────────┬───────────┘   │ only         │
          │               └──────┬───────┘
          │                      │
          └──────────┬───────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Validate configuration      │
      │  • Test Linear connection    │
      │  • Test Codegen API (if set) │
      │  • Verify git repo           │
      └──────────────┬───────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Save configuration          │
      │  ~/.cyrus/config.json        │
      └──────────────┬───────────────┘
                     │
                     ▼
      ┌──────────────────────────────┐
      │  Start EdgeWorker            │
      │  • Connect to proxy          │
      │  • Initialize executors      │
      │  • Begin monitoring          │
      └──────────────────────────────┘

Configuration example:
{
  "repositories": [...],
  "codegen": {
    "enabled": true,
    "orgId": "my-org",
    "apiToken": "***",
    "strategy": "hybrid-smart",
    "maxCostPerTask": 1.0,
    "maxCostPerDay": 50.0
  }
}
```

---

## 10. Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                       Monitoring Dashboard                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  System Status                                                    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ Local Executor │  │ Cloud Executor │  │ Proxy Connect  │    │
│  │   ✅ Ready     │  │   ✅ Ready     │  │   ✅ Active    │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Active Tasks (4)                                                 │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ CEA-123  │ Feature: Auth      │ Cloud   │ 5m ago  │ 85%  │  │
│  │ CEA-124  │ Bug: Memory leak   │ Cloud   │ 12m ago │ 60%  │  │
│  │ CEA-125  │ Orchestrator       │ Local   │ 2m ago  │ 30%  │  │
│  │ CEA-126  │ Bug: API error     │ Cloud   │ 8m ago  │ 75%  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Metrics (Last 7 days)                                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Total Tasks:      127                                      │  │
│  │ Success Rate:     94.5%                                    │  │
│  │ Avg Duration:     12m 34s                                  │  │
│  │                                                            │  │
│  │ Executor Usage:                                            │  │
│  │ • Local:  42 (33%) ████████░░░░░░░░                       │  │
│  │ • Cloud:  85 (67%) ████████████████░                       │  │
│  │                                                            │  │
│  │ Cost Breakdown:                                            │  │
│  │ • Total Cost:     $67.34                                   │  │
│  │ • Avg/Task:       $0.79                                    │  │
│  │ • Budget Used:    67% / $100 daily limit                   │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Recent Completions (Last 5)                                      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ ✅ CEA-120 │ Feature: Export    │ Cloud  │ 8m   │ $0.45  │  │
│  │ ✅ CEA-119 │ Bug: Validation    │ Local  │ 5m   │ $0.00  │  │
│  │ ✅ CEA-118 │ Test: Integration  │ Cloud  │ 15m  │ $1.23  │  │
│  │ ❌ CEA-117 │ Feature: Dashboard │ Cloud  │ 20m  │ $1.50  │  │
│  │ ✅ CEA-116 │ Orchestrator       │ Local  │ 3m   │ $0.00  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

Available commands:
• cyrus status          - Show current status
• cyrus stats           - Detailed statistics
• cyrus cost-report     - Cost breakdown
• cyrus logs <task-id>  - View task logs
```

---

## 11. Security & Isolation

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Boundaries                           │
└─────────────────────────────────────────────────────────────────┘

Local Execution (ClaudeRunner):
┌─────────────────────────────────────────────────────────────────┐
│  User's Machine                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Git Worktree 1 (Issue CEA-123)                         │   │
│  │  • Isolated branch                                      │   │
│  │  • Read/Write to specific paths only                    │   │
│  │  • Controlled tool access (allowedTools)                │   │
│  │  • Local environment variables                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Git Worktree 2 (Issue CEA-124)                         │   │
│  │  • Isolated branch                                      │   │
│  │  • Separate working directory                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Security measures:                                              │
│  • File system isolation via worktrees                           │
│  • Tool restriction via allowedTools config                      │
│  • No network access (unless explicitly allowed)                 │
│  • User controls all credentials                                 │
└─────────────────────────────────────────────────────────────────┘

Cloud Execution (Codegen):
┌─────────────────────────────────────────────────────────────────┐
│  Codegen Infrastructure (SOC 2 Compliant)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sandbox 1 (Task from CEA-123)                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  • Ephemeral container                             │  │  │
│  │  │  • Isolated file system                            │  │  │
│  │  │  • Controlled network access                       │  │  │
│  │  │  • git credentials (scoped to repo)                │  │  │
│  │  │  • No cross-sandbox communication                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sandbox 2 (Task from CEA-124)                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  • Separate ephemeral container                    │  │  │
│  │  │  • Isolated from Sandbox 1                         │  │  │
│  │  │  • Destroyed after completion                      │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Security measures:                                              │
│  • SOC 2 Type II certified infrastructure                        │
│  • Complete sandbox isolation                                    │
│  • Ephemeral environments (auto-destroyed)                       │
│  • Encrypted data at rest and in transit                         │
│  • No data persistence between tasks                             │
│  • Audit logs for all actions                                    │
└─────────────────────────────────────────────────────────────────┘

Credential Management:
┌─────────────────────────────────────────────────────────────────┐
│  ~/.cyrus/config.json (encrypted at rest)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  {                                                       │   │
│  │    "repositories": [{                                    │   │
│  │      "linearToken": "lin_api_***" // (scoped to Linear) │   │
│  │    }],                                                   │   │
│  │    "codegen": {                                          │   │
│  │      "apiToken": "codegen_***" // (scoped to Codegen)   │   │
│  │    }                                                     │   │
│  │  }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  • Tokens stored locally on user's machine                       │
│  • Never transmitted except to authorized services               │
│  • Scoped permissions (Linear, Codegen, GitHub)                  │
│  • Rotation support via CLI                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Migration Path (для существующих пользователей)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Phase 1: Install Update                       │
│                    (Week 1)                                      │
└─────────────────────────────────────────────────────────────────┘

Current users:
┌──────────────────────┐
│ cyrus v0.1.x         │
│ • Local only         │
│ • ClaudeRunner       │
└──────────┬───────────┘
           │
           │ npm install -g cyrus-ai@latest
           │
           ▼
┌──────────────────────┐
│ cyrus v0.2.0         │
│ • Backward compat    │
│ • Local by default   │
│ • Codegen optional   │
└──────────────────────┘

Result: No breaking changes, system works as before

┌─────────────────────────────────────────────────────────────────┐
│                    Phase 2: Enable Codegen                       │
│                    (Week 2+, user's choice)                      │
└─────────────────────────────────────────────────────────────────┘

User runs:
$ cyrus codegen setup

Interactive wizard:
┌────────────────────────────────────────────┐
│ 🚀 Codegen Setup                           │
│                                            │
│ Codegen enables cloud execution with:      │
│ • Parallel task processing                 │
│ • Isolated sandboxes                       │
│ • Managed infrastructure                   │
│                                            │
│ Get started at: https://codegen.com/signup │
│                                            │
│ Organization ID: _____________             │
│ API Token: ____________________            │
│                                            │
│ Execution strategy:                        │
│ ○ local-only (current behavior)            │
│ ◉ hybrid-smart (recommended)               │
│ ○ cloud-only                               │
│                                            │
│ Cost limits:                               │
│ Max per task: $___1.00_____                │
│ Max per day: $_____50.00___                │
│                                            │
│ [Continue] [Skip]                          │
└────────────────────────────────────────────┘

Configuration updated:
~/.cyrus/config.json
{
  "repositories": [...], // unchanged
  "codegen": {
    "enabled": true,
    "orgId": "user-org",
    "apiToken": "***",
    "strategy": "hybrid-smart",
    "maxCostPerTask": 1.0,
    "maxCostPerDay": 50.0
  }
}

Restart cyrus:
$ cyrus

Output:
✅ Local Executor: Ready
✅ Cloud Executor (Codegen): Ready
📊 Strategy: hybrid-smart
🎯 Ready to process issues

┌─────────────────────────────────────────────────────────────────┐
│                    Phase 3: Monitor & Optimize                   │
│                    (Ongoing)                                     │
└─────────────────────────────────────────────────────────────────┘

User monitors usage:
$ cyrus stats --period week

Output:
📊 Execution Statistics (Last 7 days)
────────────────────────────────────
Total Tasks:      45
Success Rate:     93.3%
Avg Duration:     8m 32s

Executor Usage:
• Local:  15 tasks (33.3%)
• Cloud:  30 tasks (66.7%)

Cost:
• Total:      $23.50
• Avg/task:   $0.78
• Trend:      ↓ 12% vs last week

Performance:
• 2.1x faster than local-only
• 4 tasks running in parallel (peak)

User adjusts strategy if needed:
$ cyrus config set codegen.strategy cost-optimized

✅ Configuration updated
🔄 Restart EdgeWorker to apply changes

Benefits realized:
• Faster issue resolution (2x speedup)
• Better resource utilization (parallel)
• No local machine overhead
• Enterprise-grade security (SOC 2)
```

---

**Конец диаграмм**
