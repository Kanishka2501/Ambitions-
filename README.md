# Northstar AI — Personal Goal Operating System

> **"Your biggest goal deserves a better system."**

Northstar AI is a premium, production-grade personal goal operating system. It transforms ambitious, high-stakes life destinations into realistic, chronological roadmaps, high-leverage daily execution systems, adaptive AI coaching, and self-improving weekly retrospectives.

---

## 1. System Architecture

Northstar AI is built on a modern full-stack architecture:

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Server-side Node.js with Express and Vite middleware in development.
- **AI Engine**: Gemini 3.8 (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK with structured JSON output schemas and deterministic domain fallbacks.
- **Persistence**: High-performance persistent JSON database (`data/northstar-store.json`) with strict user data isolation, role-based access control, and complete right-to-erasure deletion.
- **Design Constitution**: Conforms strictly to the Universal Frontend Design Constitution (anti-AI slop, zero-pill discipline, 60-30-10 color allocation, tabular figures, and responsive layout).

---

## 2. Signature 7-Theme System

Northstar includes a persistent multi-palette theme engine with full dark/light mode optical compensation:

1. **Lavender & Purple**: Celestial signature theme with violet nebula tones.
2. **Midnight Dark**: Minimalist obsidian canvas with precision sapphire and cyan accents.
3. **Clean White & Silver**: Architectural monochrome with titanium and platinum clarity.
4. **Soft Pink & Rose**: Warm quartz and rose dawn for calm, grounded discipline.
5. **Ocean Blue**: Deep marine navy paired with crisp horizon azure.
6. **Warm Cream & Gold**: Classic luxury editorial parchment with solar amber brilliance.
7. **Forest Emerald**: Grounded pine evergreen and vibrant moss growth accents.

---

## 3. Core Modules & Workflows

### A. Smart Onboarding & AI Path Decomposition
- 5-step guided questionnaire: Primary Destination, Starting Line & Baseline, Timeline & Weekly Bandwidth, Resources & Guardrails, and Coaching Persona.
- Server-side Gemini 3.8 model decomposes the goal into 3 sequential milestones, initial high-impact tasks, risk mitigations, and the smallest immediate 5-minute action.

### B. Daily Execution Engine
- Task manager with priorities (`urgent`, `high`, `medium`, `low`), estimated duration, milestone tags, and subtasks.
- **"What should I do right now?" Engine**: Algorithmic decision ranker evaluating urgency, due date, open status, and available time budget to prevent decision paralysis.
- **Integrated Focus Mode**: 25m / 50m Pomodoro timer automatically syncing completed time to the active task.

### C. Adaptive AI Coach
- Context-aware chat drawer with live database access to the user's active goal, progress %, completed tasks, and known blockers.
- 3 distinct personas:
  - **Gentle**: Empathetic, encouraging, and psychologically safe.
  - **Strategic**: Analytical, pragmatic, and focused on leverage and trade-offs.
  - **Direct**: Candid, concise, and accountability-driven.

### D. Self-Improving Retrospectives
- Weekly review rubric auditing accomplishments, friction, lessons, wasted time, and needed adjustments.
- Real task metrics integration (completed vs missed count).
- AI synthesis that recommends 3 vital priorities for next week and queues calibrated tasks into the execution engine.

### E. Research Vault & Knowledge Base
- Save tutorials, books, articles, notes, and documentation.
- AI takeaway extractor generating instant actionable steps.

### F. Founder & Admin Console
- Accessible to users with `founder_admin` role.
- Real-time aggregate telemetry (active users, completed actions, deep work hours, AI call counts, engine status, and configurable cost limits).

---

## 4. Getting Started & Running Locally

### Prerequisites
- Node.js 20+ installed.

### Installation
```bash
# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `GEMINI_API_KEY` is present. In Google AI Studio, this is automatically injected via the Secrets panel.

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` with Express backend endpoints and Vite HMR middleware.

### Production Build
```bash
npm run build
npm start
```

---

## 5. Automated Testing

Run the automated test suite verifying data isolation, milestone progress math, task execution, AI response validation, and account deletion:

```bash
npm test
```

All 9 test suites validate:
1. User isolation boundary
2. Goal access controls
3. Milestone & task progress recalculation
4. "What should I do right now?" ranking
5. AI planner schema validation
6. Adaptive coach persona responses
7. Weekly review synthesis
8. Right-to-erasure cascade deletion

---

## 6. Security, Privacy & Governance

- **Zero Client-Side Secrets**: All `@google/genai` calls and API credentials remain strictly on the backend.
- **Data Minimization & Isolation**: Queries strictly filter by authenticated `userId`.
- **Right to Erasure**: Users can permanently delete their entire account, goals, tasks, reviews, and logs with one click in Settings.
- **Zero AI Training**: User notes and private reflections are never used to train public foundation models.
