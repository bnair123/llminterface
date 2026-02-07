# Project Plan - Liquid Glass LLM App

## 1) Vision

Build a fully featured, high-quality LLM application with desktop-first polish, starting with macOS and Windows, then web, then iOS.
The app should support advanced chat workflows, multi-model orchestration, verifiable outputs, tool integrations, file and OCR workflows, and future agentic coding.

## 2) Product Priorities

- Primary platform order: macOS, then Windows, then Web, then iOS.
- Primary delivery goal: excellent desktop UX and reliability before cross-platform expansion.
- Design goal: platform-native feel per OS, including Apple-style liquid glass on macOS.
- Architecture goal: strict interface-first design and clear frontend/backend separation.
- Data goal: start with local-first persistence and sync abstractions, then integrate Convex later with minimal refactor.

## 3) Non-Negotiable Engineering Principles

- Interface-first everywhere; all external providers and core subsystems communicate through typed contracts.
- Frontend and backend remain clearly split; no business orchestration logic in UI components.
- Domain-driven boundaries; chat, model routing, tool execution, memory, and search are isolated modules.
- Ports/adapters pattern; implementation details never leak into domain logic.
- Replaceability by design; providers can be swapped without touching feature code.
- Security by default; tool calls and code execution require policy guardrails and auditability.

## 4) Architecture Overview

### Client Apps

- `apps/desktop`: Tauri v2 + React + TypeScript; highest fidelity target for macOS and Windows.
- `apps/web`: React + TypeScript; shares UI and domain contracts.
- `apps/mobile`: planned later; uses shared contracts/domain and mobile-specific shell.

### Shared Packages

- `packages/contracts`: API schemas, event contracts, DTOs, validation.
- `packages/domain`: chat state, branch logic, memory policies, orchestration request builders.
- `packages/ui`: design system, platform themes, typography, reusable components.
- `packages/sdk`: client-side service interfaces and adapters.

### Backend/Service Layer

- `services/orchestrator`: model routing, multi-model fanout, verification flows, retries/fallbacks.
- `services/search-gateway`: Tavily/Perplexity/custom adapters behind one interface.
- `services/mcp-gateway`: remote MCP registry, capability discovery, approvals, policy enforcement.
- `services/sandbox-python`: isolated code execution, chart/file artifact handling, quotas.
- `services/file-pipeline`: uploads, extraction, OCR, image routing for vision models.
- `services/memory`: capture policies, retrieval, forgetting, compaction metadata.
- `services/metrics`: latency, token usage, cost, success rates, quality signals.

### Data Layer

- Phase 1-6: local-first storage with repository interfaces and sync abstraction.
- Phase 7+: Convex adapter plugged into sync layer; no UI rewrite and minimal domain change.
- Future-ready retrieval abstraction for vector store and embeddings.

## 5) Interface Contracts (Core)

- `IModelProvider`: list models, stream completion, capabilities, pricing, context limits.
- `IOrchestrator`: run single/parallel/verify workflows, cancellation, run status events.
- `ISearchProvider`: query, normalize results, citations, fallback metadata.
- `IMCPServerAdapter`: initialize, list tools, call tool, capability and health status.
- `IPythonRuntime`: execute code, enforce limits, return artifact manifest.
- `IFileProcessor`: parse text, OCR extraction, media metadata, content hashing.
- `IMemoryStore`: create/update/retrieve/forget memory entries by scope and policy.
- `ISyncEngine`: checkpoints, cursor position, conflict handling, offline queue replay.
- `IModelCatalog`: model metadata management including logos, costs, capabilities, stats.

## 6) UX and Design System Direction

- macOS: liquid-glass surface language with translucency, depth, soft gradients, and native vibrancy bridge.
- Windows: fluent-style material and spacing tuned to native expectations, not copied Apple visuals.
- Web: responsive adaptation preserving brand language while respecting browser constraints.
- Typography: intentional pairings and readability-focused scale; no generic default UI look.
- Chat rendering: beautiful markdown, LaTeX, syntax-highlighted code, tables, callouts, attachments.
- Motion: meaningful transitions for stream state, branch changes, panel open/close, and artifacts.

## 7) Feature Scope (MVP to Full)

### Core Chat

- Streaming chat responses.
- Model selector and per-chat model overrides.
- Multi-model runs in parallel with lane view.
- Branching chats from any message and branch navigation.
- Verification pass modes: async annotate and strict gate mode.

### Knowledge and Context

- Auto title generation.
- Context compaction and summarization checkpoints.
- User-directed and policy-based memories.
- Memory controls: save, inspect, edit, forget.

### Tooling and Integrations

- Pluggable web search providers: Tavily, Perplexity, custom.
- MCP integration for external tools and tool registry UX.
- Python interpreter sandbox with chart/file outputs and artifact previews.
- File upload with extraction pipeline and OCR model selector.
- Vision-aware routing for image-capable models.

### Productivity

- Projects and folders.
- Profiles/system prompts assignable by workspace/project/chat.
- Notes with markdown editor and cross-linking to chats.
- Model catalog editor for custom metadata, logos, capabilities, and cost.

## 8) Delivery Phases

### Phase 0 - Foundation and Skeleton (Weeks 1-2)

- Set up monorepo, build tooling, CI, linting, testing baseline.
- Establish contracts package and service interface definitions.
- Implement desktop shell scaffolding and base navigation.
- Create design tokens and platform theme architecture.
- Exit criteria: app boots on macOS and Windows; CI green; contract tests running.

### Phase 1 - Desktop Core Chat MVP (Weeks 3-4)

- Streaming chat UI and message persistence.
- Model selection and normalized model catalog ingestion.
- Markdown + LaTeX + code highlighting renderer.
- Basic projects/folders and chat list structure.
- Exit criteria: stable single-model chat with high-quality rendering and desktop polish baseline.

### Phase 2 - Advanced Chat Orchestration (Weeks 5-6)

- Multi-model parallel execution and lane results.
- Branch chat creation and branch history navigation.
- Verification service integration and result badges.
- Run state machine, cancellation, retries, timeout handling.
- Exit criteria: parallel and verify modes production-safe with observability.

### Phase 3 - Search + MCP Integration (Weeks 7-8)

- Search gateway with Tavily/Perplexity/custom adapters.
- Result normalization, dedupe/rerank, citation formatting.
- MCP server registry, capability discovery, health checks.
- Tool-call approval UX and policy controls.
- Exit criteria: grounded answers with source citations and controlled tool access.

### Phase 4 - Python Runtime and Artifacts (Weeks 9-10)

- Remote isolated execution service with resource controls.
- Artifact manifest model and secure file delivery.
- Chart rendering workflows and output previews.
- Execution logs and safety events.
- Exit criteria: reliable code execution with strict limits and downloadable outputs.

### Phase 5 - Files, OCR, and Vision Routing (Week 11)

- Attachment pipeline for text files, PDFs, and images.
- OCR model selector and extraction policy.
- Vision-model conditional routing.
- Exit criteria: robust upload-to-context flow with OCR/vision toggles.

### Phase 6 - Memory and Context Compaction (Week 12)

- Memory policy engine and scoped memories.
- Auto/manual memory workflows in UI.
- Summarization checkpoints for long conversations.
- Title generation refresh and compaction traceability.
- Exit criteria: long-chat performance and context quality stay stable.

### Phase 7 - Sync Abstraction Hardening and Convex Integration (Weeks 13-14)

- Keep existing sync interface; implement Convex adapter.
- Add last-position sync, multi-device cursor semantics.
- Conflict handling and idempotent mutation rules.
- Exit criteria: cross-device continuity without domain or UI rewrites.

### Phase 8 - Web Stabilization then iOS Planning (Weeks 15+)

- Production web packaging and browser-specific hardening.
- Performance tuning and auth/session polish.
- iOS scope definition based on shared contracts.
- Exit criteria: web stable; iOS implementation plan approved.

## 9) Quality Gates

- Unit tests for domain and contract validation.
- Integration tests for orchestration, search, MCP, runtime pipeline.
- E2E desktop tests for major user flows.
- Security tests for tool permissions, sanitization, and upload handling.
- Performance budgets for first response latency, stream smoothness, and memory usage.

## 10) Security and Compliance Baseline

- Secrets only on backend; never exposed in client bundles.
- Tool risk levels and explicit approval for sensitive actions.
- Runtime isolation with strict CPU/memory/time/network limits.
- Output sanitization and markdown XSS protections.
- Audit logs for model runs, tool calls, approvals, and policy changes.

## 11) Observability and Product Metrics

- Track response latency, token usage, cost, error rates by model/provider.
- Track verification outcomes and citation coverage.
- Track Python runtime queue times, success rates, artifact sizes.
- Track memory saves/forgets and compaction impact.
- Build dashboards for reliability and cost control.

## 12) Definition of Done for Each Feature

- Contract added or updated with tests.
- Adapter implementation complete with integration tests.
- UI wired only through service interfaces.
- Telemetry and error states implemented.
- Security checks passed and documented.
- User-facing behavior verified on macOS and Windows.

## 13) Risks and Mitigations

- Risk: desktop polish delayed by feature sprawl; mitigation: strict phase boundaries and freeze windows.
- Risk: unsafe code execution path; mitigation: isolate runtime remotely and enforce hard policy limits.
- Risk: provider drift and API variability; mitigation: adapter contracts and capability flags.
- Risk: sync complexity when Convex is added; mitigation: sync engine interface and idempotent ops from day one.
- Risk: multi-model costs; mitigation: budget caps, run policies, and default conservative presets.

## 14) Immediate Next Actions

- Finalize monorepo layout and package names.
- Author contracts for orchestration, model catalog, search, MCP, runtime, files, memory, sync.
- Build Phase 0 skeleton and CI.
- Start Phase 1 desktop chat MVP with rendering stack and platform theming.
