# Niubiz BCRP Certification: Real-Time Test Execution & Performance Comparator

A high-density, real-time certification dashboard and comparative test execution cockpit for BCRP (Banco Central de Reserva del Perú) PSP Use Cases, comparing performance between **Other Account Providers (Normal execution)** and **Juspay-Niubiz Account Provider (Turing engine execution)**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and domain choices were aligned via clarification questions and grounded in the provided `Niubiz_Certification_Tracker_808d05f6` dataset:

- **Execution Mode Definition**:
  - **Normal Execution**: Standard certification run across standard Account Providers (Industry baseline / standard PSP flows).
  - **Turing Execution**: High-performance, automated execution via the Juspay-Niubiz Account Provider suite (accelerated orchestration, optimized payload serialization, and automated retry handling).
- **Core Metrics Prioritization**: Real-time test cases executed with granular status transitions (`Pass`, `Fail`, `Retest`, `Blocked`, `In Progress`, `Pending`), execution velocity, pass rate percentages, blocker analysis, and daily plan compliance against target milestones.
- **Interaction Model**: Interactive real-time test runner with live playback, step-by-step progress feed, status editing/overrides, filter controls (by PSP Role: Payer vs Payee, and Phase: Week 1 TAPP↔TAPP vs Week 2 TAPP↔CCE), and bidirectional CSV synchronization with the Niubiz Certification Tracker dataset.

---

### 1. Overview & Core Concept

- **What It Does**:
  - Ingests and synchronizes the 143 BCRP PSP certification use cases from the Niubiz Certification Tracker.
  - Provides a **Real-Time Test Runner** that allows QA and certification engineers to run tests either individually or in batches, simulate real-time live execution streams, and record status updates instantaneously.
  - Delivers a dedicated **Performance & Execution Comparator** that contrasts Normal execution (Other Account Providers) against Turing execution (Juspay-Niubiz Account Provider) on metrics including latency, pass rate, blocked resolution time, and execution velocity.
  - Supports manual status overrides, root-cause notes for blocked/failed tests, and instant CSV export/import keeping tracker spreadsheets in sync.
- **Target Audience & Persona**:
  - Payment Integration Engineers, QA Certification Specialists, and Release Managers leading BCRP / Niubiz interoperability compliance across TAPP (Transferencias de Acreditación Casi Inmediata) and CCE (Cámara de Compensación Electrónica).
- **Key Value**:
  - Eliminates manual spreadsheet lag, provides instant visibility into certification readiness (Payer PSP vs Payee PSP), and quantifiably validates the superior execution reliability and speed of the Juspay-Niubiz platform.

---

### 2. User Experience & Visual Design

- **Layout Structure**:
  - **Top Navigation Bar**: Strict 3-zone contract with clean brand title (`Niubiz BCRP Certification`), primary navigation anchors (`Overview`, `Live Runner`, `Comparator`, `Daily Plan`, `Use Cases`), and a primary quick-action button (`Run All Tests` / `Sync CSV`).
  - **Executive KPI Row**: 4 crisp metric tiles with tabular numerals (`font-mono tabular-nums`) showing:
    - Total Scope & Executed Count (143 Cases, 56% Executed vs Due)
    - Pass Rate (100% on executed tests)
    - Blocked / At-Risk Items (5 Blocked with root-cause indicators)
    - Turing Performance Delta (e.g., +3.4x execution speedup & 0 timeout failures)
  - **Interactive Mode Selector**: Segmented filter bar allowing switching between:
    - **Unified Overview & Milestones**: Daily progress burn-down, phase tracking (Week 1 TAPP↔TAPP vs Week 2 TAPP↔CCE), and role distribution (Payer vs Payee).
    - **Side-by-Side Comparator**: Split-screen analytical view comparing Other Account Providers vs Juspay-Niubiz (Turing) with side-by-side status, response latency curves, and failure breakdown.
    - **Live Execution Console**: Real-time test dispatch stream with step-level logs, status toggle triggers, and timer execution.
    - **Detailed Test Case Ledger**: High-density searchable and filterable table with inline status toggles, phase tags, and retest queues.

- **Visual Identity & Theme**:
  - **Color Strategy (60-30-10)**:
    - 60% neutral dark/light slate canvas (`bg-slate-900` / `bg-slate-50`)
    - 30% structural surfaces (`bg-slate-800/90` or `bg-white`, crisp 1px borders `border-slate-200/border-slate-700`)
    - 10% high-intent functional accents (Niubiz cobalt blue `sky-600` / `indigo-600`, with semantic emerald for Pass, amber for Blocked/Retest, rose for Fail)
  - **Zero-Pill Discipline**: Status labels rendered as clean text badges with subtle geometric dot indicators or soft segmented cells—no candy pill bubbles.
  - **Typography**: `Plus Jakarta Sans` for clean enterprise headers and UI controls, paired with `JetBrains Mono` / `tabular-nums` for timestamps, counts, latencies, and transaction codes.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-time In-Browser Engine with CSV Dual-State**:
  - *Chosen Approach*: Maintain a reactive in-memory state initialized directly with the official `Niubiz_Certification_Tracker_808d05f6` CSV dataset, backed by browser `localStorage` persistence and instant import/export.
  - *Why*: Enables instant interactive testing, zero server lag, offline readiness, and full simulation of streaming execution without requiring external database provisioning delays.
  - *Alternatives Considered*: Pure static mock (rejected because user requires real-time status updates and execution).
- **Decision 2: Realistic Test Case Expansion**:
  - *Chosen Approach*: The provided tracker specifies 143 total cases distributed across Payer/Payee roles and Week 1 (TAPP↔TAPP) / Week 2 (TAPP↔CCE) daily buckets. We synthesize the concrete 143 test cases with standard BCRP payment scenarios (Funds Transfer, Authorization, Status Check, Timeout Reversal, Duplicate Request, Insufficient Funds, Inter-bank Settlement) so each row represents an actionable test.
  - *Why*: Allows the QA engineer to inspect realistic transaction payloads, error codes, and step-level statuses.
- **Decision 3: Dedicated Provider Comparison Architecture**:
  - *Chosen Approach*: Contrast metrics across latency distributions, step-by-step retry rates, and blockage resolution between "Other Account Providers (Normal)" and "Juspay-Niubiz AP (Turing)".
  - *Why*: Directly fulfills the user's specific requirement to evaluate performance differences.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Niubiz BCRP Dashboard Root                        │
├────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│ │ Top Bar & Milestone HUD  │  │ CSV Export / Import Sync & Controls  │ │
│ └──────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Navigation View Tabs:                                              │ │
│ │ [ Dashboard Overview ] [ Side-by-Side Comparator ] [ Live Runner ] │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────┐  ┌──────────────────────────────────────┐ │
│ │  Normal Provider Engine  │  │        Turing Provider Engine        │ │
│ │ (Other Account Providers)│  │      (Juspay-Niubiz Platform)        │ │
│ │  - Avg Latency: 840ms    │  │  - Avg Latency: 195ms                │ │
│ │  - Standard Retry queue  │  │  - Smart idempotent replay           │ │
│ │  - 5 Blocked / Incomplete│  │  - 0 Blocked / Auto-resolved         │ │
│ └──────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Dynamic 143-Case Data Grid (Filter by Role, Phase, Status, Date)   │ │
│ │ Inline Status Override | Batch Executor | Real-time Stream Log     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

- **Data Models**:
  - `TestCase`: `{ id, code, title, role: 'Payer PSP' | 'Payee PSP', phase: 'Week 1 – TAPP↔TAPP' | 'Week 2 – TAPP↔CCE', scheduledDate, planned: boolean, normalStatus: TestStatus, turingStatus: TestStatus, normalLatencyMs: number, turingLatencyMs: number, blockedReason?: string, lastUpdated: string }`
  - `DailyProgress`: `{ date, day, weekday, phase, planned, pass, fail, retest, blocked, inProgress, notExecuted, executed, pctExecuted, cumulativePlanned, dayStatus }`
  - `TestStatus`: `'Pass' | 'Fail' | 'Retest' | 'Blocked' | 'In Progress' | 'Pending'`
- **Interactive Component & State Mapping**:
  - **Live Runner Component**: Allows single or multi-case execution with animated step progressions (`Initiate` -> `Validate` -> `Process` -> `Complete`), updating metrics in real time.
  - **Status Override Modal/Dropdown**: Enables instant modification of any test case status, updating daily rollups and KPI metrics synchronously.
  - **CSV Exporter/Importer**: Parses updated data back to tracker format or re-loads updated CSV files with error validation.
