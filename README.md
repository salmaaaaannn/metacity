# METACITY
## Autonomous AI City + Infrastructure Digital Twin
### Phase 2 — Living Autonomous AI City

[![Phase](https://img.shields.io/badge/Phase-2%20Living%20Autonomous%20AI%20City-emerald)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI%20%2B%20Three.js%20%2B%20NetworkX-orange)](.)

---

METACITY is an **original, open-source** autonomous AI city simulation and infrastructure digital twin.
Phase 2 transforms the city foundation into a **Living Autonomous AI Ecosystem**: 1,000 active AI citizens with diverse demographic profiles, households, realistic daily schedules, a 20-state FSM, multi-modal transport utility choices (Walk, Car, Bus, Metro, Railway), active moving buses with boarding/alighting queues, 1,185 operating businesses with workers and customer footfall, 2D animated human billboard sprites, and interactive citizen & district inspection with smooth camera tracking.

---

## 🌆 Phase 2 Highlights

- **1,000 Active Simulated Citizens**:
  - Distinct demographic profiles: Children (16%), Students (12%), Industrial Workers (14%), Office Workers (18%), Professionals (22%), Service Workers (10%), Business Owners (4%), Retired/Elderly (4%).
  - Grouped into realistic households sharing residential buildings.
  - Workers assigned to actual workplaces (offices, factories, retail shops); students assigned to schools and universities.
- **20-State Finite State Machine (FSM)**:
  - `SLEEPING`, `AT_HOME`, `PREPARING`, `WALKING`, `COMMUTING`, `DRIVING`, `WAITING_FOR_BUS`, `RIDING_BUS`, `WAITING_FOR_METRO`, `RIDING_METRO`, `RIDING_RAILWAY`, `WORKING`, `STUDYING`, `SHOPPING`, `EATING`, `RELAXING`, `TALKING`, `IN_PARK`, `RETURNING_HOME`.
  - Realistic 24-hour schedules with staggered rush hours.
- **Multi-modal Transport Utility Engine**:
  - Real-time decision scoring comparing travel time, monetary cost, comfort, walking distance, vehicle ownership, and past delay memories.
  - Transport choices feed directly into road traffic volumes, dynamically altering BPR congestion delays.
- **Active Public Transit**:
  - **12 Bus Routes** with an active moving bus fleet, stop queues, capacity limits, and passenger boarding/alighting.
  - **Metro Lines A/B/C & Railway** station platform queues, passenger trips, and ridership tracking.
- **1,185 Operating Businesses**:
  - Offices, factories, supermarkets, restaurants, and retail shops employing citizens and hosting customers during lunch and leisure hours.
- **Human Visual System (2D Billboard Sprites)**:
  - Procedural character sprites rendering crisp human characters (suits, hardhats, backpacks, casual wear) facing camera.
  - 4-way directional walking leg animation cycles synced to velocity.
  - 3D vehicle layer rendering cars and transit buses with directional heading.
- **Interactive Inspection Suite**:
  - **Citizen Inspector**: Click any citizen to inspect full biography, state, schedule, decision rationale ("Why Metro?"), satisfaction, stress, and experience memory.
  - **Follow Citizen Camera**: Smoothly tracks the selected citizen through the city.
  - **District Inspector**: Click any district bounds to inspect live traffic congestion %, public transit share, business revenue, and satisfaction index.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND (React 18 + TypeScript + Three.js)            │
│  CityCanvas · CitizenSpriteManager (HumanBillboards)    │
│  VehicleLayer · CameraController (FollowCam)            │
│  CitizenInspector · DistrictInspector · TopBar · Store   │
└──────────────────┬──────────────────────────────────────┘
                   │  REST + WebSocket (5-10 Hz Delta Stream)
┌──────────────────▼──────────────────────────────────────┐
│  BACKEND (Python 3.12 + FastAPI + asyncio)               │
│  SimulationEngine                                        │
│  ├─ SimClock (24h daily schedule cycle)                 │
│  ├─ 1,000 Citizens (FSM + Memory + Demographics)        │
│  ├─ TransportChooser (Utility scoring + Delay memory)   │
│  ├─ BusSystem (12 routes + moving fleet + queues)       │
│  ├─ MetroRailwaySystem (Stations + ridership)           │
│  ├─ BusinessManager (1,185 businesses + staffing)       │
│  ├─ RoadGraph (NetworkX A* + BPR volume delay)          │
│  └─ PedestrianGraph (A* sidewalk routing)               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Backend:
```bash
cd metacity/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend (new terminal):
```bash
cd metacity/frontend
npm run dev
```

Open: **http://localhost:5173**

---

## 🧪 Test Suite

```bash
# Backend test suite (20 automated tests)
cd metacity/backend
.venv/bin/pytest tests/ -v
# Result: 20 passed in 0.20s

# Frontend test suite (8 automated tests)
cd metacity/frontend
npm run test
# Result: 8 passed in 0.24s

# Frontend TypeScript check
npx tsc --noEmit
# Result: 0 errors
```

---

## 📋 Development Roadmap

| Phase | Status | Focus |
|-------|--------|-------|
| **Phase 1** | ✅ Complete | City Foundation (8000m world, 12 districts, baseline infrastructure, budget) |
| **Phase 2** | ✅ **Complete** | **Living Autonomous AI City** (FSM, multimodal transit, buses, businesses, sprites, inspectors) |
| **Phase 3** | 🔜 Next | Infrastructure Editor + Budget Simulation + Scenario Comparison |
| **Phase 4** | 🔜 Future | Disaster Simulation + Digital Twin Blueprint Generation |
| **Phase 5** | 🔜 Future | Multi-AI Agents + Natural Language City Planning Gateway |

---

## 📜 License & Credits

- MIT License. See [LICENSE](LICENSE).
- Technical reference for Three.js rendering: [dgreenheck/simcity-threejs-clone](https://github.com/dgreenheck/simcity-threejs-clone) (MIT © 2023 Daniel Greenheck). See [CREDITS.md](CREDITS.md).
