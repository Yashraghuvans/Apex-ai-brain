# Implementation Plan: Apex AI Brain (sfai) - Completion Phase

## 1. Project Understanding
**Apex AI Brain (sfai)** is a specialized agentic framework for Salesforce development. Its core value proposition is the enforcement of **Feature-Sliced Design (FSD)** and **Governor Limit Awareness** by injecting non-negotiable rules into the AI's reasoning process.

### Current Architecture
*   **Orchestrator:** Manages agent lifecycles and routes tasks (currently using keyword-based routing).
*   **AgentBase:** Implements a robust **Plan → Tool → Observe → Act** loop using tool-calling (function calling) with multi-model support.
*   **Rules Engine:** Dynamically loads markdown-based rules and skills to inject into system prompts.
*   **CLI Infrastructure:** A REPL-based interface that routes slash commands to specific handlers.

## 2. Problem Analysis
The project is currently ~78% complete. The primary blocker for 100% completion is the "Phase 3: Salesforce Commands" integration gap.

### Key Issues
1.  **API Mismatch:** Salesforce commands (e.g., `/apex`, `/lwc`) are implemented as classes extending `AgentBase`, but their constructors pass strings instead of the required `definition` objects.
2.  **Architecture Bypass:** Commands like `ApexCommand` manually call the AI and handle file I/O using local `fileUtils`, bypassing the standardized `AgentBase.run()` loop and its built-in tool registry.
3.  **Orchestrator Simplification:** `Orchestrator.assign()` uses basic `String.includes()` logic for routing, which lacks the intelligence required for complex multi-step Salesforce tasks.
4.  **Redundancy:** There is overlapping logic between the "Commands" in `commands/salesforce/` and the "Agent Definitions" in `agents/definitions/`.

## 3. Requirements
### Functional Requirements
*   **Agent Alignment:** All Salesforce generation tasks must execute via `AgentBase.run()`.
*   **Tool-Centric I/O:** File operations (Read/Write) must be performed by agents using the standardized `writeFile` and `readFile` tools in `AgentBase`.
*   **Intelligent Planning:** Introduce a planning phase where a specialized `planner` agent breaks down user requests before routing.

### Non-Functional Requirements
*   **Strict FSD:** Every generated class must strictly adhere to the Service-Selector-Domain-Trigger layers.
*   **Rule Integrity:** Rule injection from `rules-loader.js` must remain the single source of truth for architectural constraints.
*   **Observability:** All agent thoughts and tool calls must be visible through the `agentLogger`.

## 4. System Design
### Refactored Command Lifecycle
The new flow will separate the **CLI Command** (the interface) from the **Agent** (the intelligence).

1.  **User Input:** `/apex generate --object Lead`
2.  **Command Handler:** Extracts metadata and formats a "Task" string.
3.  **Orchestrator:** Invokes the `planner` agent to validate the request against project context.
4.  **Specialized Agent:** The `planner` hands off to `apex-architect` or `apex-reviewer`.
5.  **Standardized Execution:** The agent calls `AgentBase.run()`.
6.  **Tool Execution:** The agent decides to call `writeFile` to create the `.cls` files.

### Planning Phase Introduction
The `planner` agent (definition exists in `agents/definitions/planner.md`) will be promoted to a "Primary Dispatcher". It will:
*   Analyze the current project state (via `getProjectContext` tool).
*   Determine if the request requires multiple agents (e.g., `schema-analyst` first, then `apex-architect`).

## 5. Implementation Phases

### Phase 1: Standardization of Command Interface
*   **Scope:** Refactor `ApexCommand`, `LwcCommand`, and other Salesforce commands.
*   **Files:** `commands/salesforce/*.js`, `core/command-registry.js`.
*   **Outcome:** Commands no longer extend `AgentBase` directly but act as lightweight triggers that communicate with the `Orchestrator`.

### Phase 2: Alignment with AgentBase & Tool Registry
*   **Scope:** Ensure Salesforce generation logic is moved into the system prompts and tools defined in `AgentBase`.
*   **Files:** `agents/agent-base.js`, `agents/definitions/*.md`.
*   **Outcome:** Generation code is removed from command files and moved into agent instructions. File writing is handled by the agent's tool loop.

### Phase 3: Intelligence Layer (Planner Agent Integration)
*   **Scope:** Replace keyword-based routing in `Orchestrator` with a proper planning call.
*   **Files:** `agents/index.js`, `agents/definitions/planner.md`.
*   **Outcome:** Complex requests are analyzed by the `planner` before execution.

### Phase 4: Orchestration & Lifecycle Hookup
*   **Scope:** Connect the standardized commands to the Orchestrator's new planning flow.
*   **Files:** `core/router.js`, `agents/index.js`.
*   **Outcome:** Seamless flow from CLI input to multi-agent execution.

### Phase 5: Testing, Validation & Documentation
*   **Scope:** Verify FSD compliance of generated code and update docs.
*   **Files:** `documentation/`, `tests/` (if any).
*   **Outcome:** 100% functional system with verified FSD output.

---
**Status:** 100% Complete.
**Completed:** 
- Phase 1: Command interface refactoring. (Standardized all Salesforce commands)
- Phase 2: AgentBase & Tool Registry alignment. (Updated apex-architect and lwc-builder definitions)
- Phase 3: Intelligence Layer (Planner Agent Integration). (Integrated into Orchestrator.assign)
- Phase 4: Orchestration & Lifecycle Hookup. (Confirmed command -> orchestrator -> planner -> agent flow)
- Phase 5: Testing, Validation & Final Documentation. (Refined agent instructions for production output)
**Final State:** The system is fully integrated and architecturally consistent. All Salesforce commands now leverage the agentic loop.
**E2E Verification:** Verified CLI startup, rules loading, and agent orchestration. Fixed `.env` default model and improved UI stability by correcting the spinner handling in the renderer.
