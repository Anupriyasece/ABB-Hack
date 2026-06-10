# PLC Semantic Intelligence Platform (PSIP)
### 🏆 Submission for the ABB Engineered X Hackathon

Transform IEC 61131-3 PLC programs (Ladder Logic, Structured Text, Function Block Diagrams, Sequential Function Charts) into actionable operational intelligence with interactive 3D digital twins, dependency knowledge graphs, and AI-powered multi-stakeholder narratives.

---

## 🚀 Vision & Problem Statement

Industrial automation environments run on complex PLC (Programmable Logic Controller) code that controls heavy machinery, valves, pumps, and conveyors. However:
1. **Knowledge Silos**: Understanding PLC logic requires specialized engineering expertise. Operators, maintenance crews, and training leads struggle to parse raw code.
2. **Disconnected Visuals**: Traditional SCADA/HMI screens are static, manual, and decoupled from the actual underlying control code.
3. **Reactive Maintenance**: Tracing alarm cascades or safety interlock dependencies during outages takes hours.

**PSIP** solves these challenges by compiling raw PLC logic into a **Universal Intermediate Representation (UIR)**, generating tailored multi-role narratives, building an interactive semantic dependency graph, and auto-generating an interactive, physical-based **3D Digital Twin** representation of the process topology.

---

## ✨ Key Features

### 1. Multi-Format PLC Parser Simulation Engine
- **Parsed Languages**: Structured Text (ST), Ladder Diagram (LD), Function Block Diagram (FBD), Sequential Function Chart (SFC).
- **Extraction Engine**: Automatically extracts conditions, actions, timers, counters, alarm limits, safety interlocks, and control sequences.
- **Universal Intermediate Representation (UIR)**: Standardizes different vendor implementations into a unified schema for analysis.

### 2. Stakeholder-Specific Functional Narratives
Generate custom operational narratives tailored for five critical industrial roles:
- **Control Engineer**: Deep-dive technical logic flow, register configurations, and control loops.
- **Plant Operator**: Real-time procedures, start-stop conditions, and alarm-handling manuals.
- **Maintenance Tech**: Periodic checks, troubleshooting steps, and sensor locations.
- **Training Lead**: Simplified conceptual walkthroughs for onboarding.
- **Operations Manager**: High-level production throughputs, KPIs, and process overview.

### 3. Interactive 3D Digital Twin Visualizer
- **Auto-Generated Layout**: Synthesizes the parsed PLC data to dynamically map and position equipment on a 3D floor grid.
- **Physical Realism**: High-fidelity Three.js (React Three Fiber) models for 3-Phase AC Motors, Centrifugal Pumps, Ball Valves, Conveyor Belts (with moving boxes), and Glass-Walled Vessels showing animated fluid levels.
- **Shaft-to-Shaft Coupling**: Precise alignment where pump and motor shafts face and connect directly (`z = 0.6` coupling point).
- **Dynamic Piping**: Automatically routes 3D piping between related tanks, pumps, and valves based on logic connections.
- **Interactive State Control**: Simulates active, idle, and fault states with real-time rotational animations, neon status highlights, and health indicator bars.

### 4. Interactive Semantic Knowledge Graph
- Interactive D3-powered force-directed graph illustrating connections between equipment, sensors, actuators, safety rules, and alarms.
- Highlights control relationships: *Measures, Controls, Triggers, Prevents, Protects, Causes*.

### 5. AI-Powered Industrial Analysis Engine
- **Root Cause Analysis (RCA)**: Pinpoints trigger conditions for cascade failures.
- **Impact Analysis**: Models the downstream effects of sensor faults or valve failures.
- **Control Dependency Mapping**: Visualizes which control loops govern which actuators.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19 + Tailwind CSS 4
- **3D Engine**: Three.js + React Three Fiber + `@react-three/drei`
- **Graphs**: D3.js
- **Routing**: Wouter
- **State/Data**: TanStack React Query + tRPC Client

### Backend & Storage
- **Server**: Node.js + Express.js + tRPC Server
- **Database**: Local JSON Database Fallback (`db.json`) / MySQL-compatible engines
- **ORM**: Drizzle ORM
- **LLM Integration**: Groq Cloud SDK / OpenAI-compatible API
- **File Storage**: Local Filesystem Storage Fallback (`uploads/` directory)

---

## ⚡ Getting Started (Run Completely Locally)

PSIP is configured to run fully local on Windows, macOS, or Linux, requiring **zero** external database or cloud storage configurations by falling back to local JSON databases and file folders.

### 1. Prerequisites
- **Node.js**: `v22.13.0` or higher
- **pnpm**: `v10.15.1` or higher
- **Groq API Key**: (Get one for free at [Groq Console](https://console.groq.com/))

### 2. Installation & Setup
Clone the repository and install the dependencies:
```bash
# Clone the repository
git clone <repo-url>
cd psip-webapp-main

# Install dependencies
pnpm install
```

Create a `.env` file in the root directory:
```env
# Groq API Configuration (or OpenAI-compatible service)
BUILT_IN_FORGE_API_URL=https://api.groq.com/openai
BUILT_IN_FORGE_API_KEY=gsk_your_groq_api_key_here

# Local Development Settings
PORT=3000
JWT_SECRET=super_secret_jwt_key
```

### 3. Run migrations and database setup
Generate and run local migrations:
```bash
pnpm db:push
```

### 4. Start the Application
Run the local development server:
```bash
pnpm dev
```
The server will boot, and the frontend will be available at: **`http://localhost:3000`**.

---

## 🧪 Running the Test Suite
Ensure code quality and parser stability by running the unit tests:
```bash
pnpm test
```
The Vitest suite includes 23 unit tests validating the compiler parser, sequence extraction, and summary statistics.

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for details.
