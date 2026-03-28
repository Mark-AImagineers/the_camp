# The Camp — Folder Structure

**Version:** 0.1
**Date:** 2026-03-28

---

## Current Structure

```
thecamp/
├── 00_project_roadmap/
│   ├── GDD.md              ← Game Design Document
│   ├── ROADMAP.md          ← Milestone plan
│   └── CHANGELOG.md        ← Version history (create when coding starts)
│
├── 01_documentation/
│   ├── STACK.md            ← Tech stack decisions
│   ├── UI-SPEC.md          ← UI layout and component specification
│   ├── SYSTEMS.md          ← Game systems reference
│   ├── FOLDER-STRUCTURE.md ← This file
│   └── API.md              ← Backend endpoint reference (create at M1)
│
├── 02_backend/             ← FastAPI application
│   ├── app/
│   │   ├── api/            ← Route handlers
│   │   │   ├── auth.py         ← Register, login, refresh, me
│   │   │   ├── save_slots.py   ← Create/select/delete save slots
│   │   │   └── ...
│   │   ├── models/         ← SQLAlchemy models
│   │   ├── schemas/        ← Pydantic schemas
│   │   ├── services/
│   │   │   ├── auth.py         ← JWT creation, password hashing, token validation
│   │   │   ├── expedition.py   ← Run engine (server-authoritative)
│   │   │   ├── narrative.py    ← Claude API integration
│   │   │   ├── loot.py         ← Loot table generation
│   │   │   └── survivor.py     ← Survivor generation + management
│   │   ├── core/
│   │   │   ├── config.py       ← Settings / env vars
│   │   │   ├── database.py     ← DB connection + RLS session setup
│   │   │   └── security.py     ← JWT deps, get_current_user, get_current_save_slot
│   │   └── main.py
│   ├── alembic/            ← Database migrations
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── 03_frontend/            ← React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── TopBar/
│   │   │   ├── PeoplePanel/
│   │   │   ├── ExpeditionFeed/
│   │   │   ├── ZonePanel/
│   │   │   ├── StashPanel/
│   │   │   └── BottomBar/
│   │   ├── hooks/
│   │   │   └── useExpeditionFeed.ts    ← SSE connection hook
│   │   ├── store/                      ← Zustand game state
│   │   │   ├── campStore.ts
│   │   │   ├── expeditionStore.ts
│   │   │   └── survivorStore.ts
│   │   ├── types/                      ← TypeScript interfaces
│   │   ├── utils/
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── 04_scripts/             ← Utility scripts
│   ├── seed_zones.py       ← Populate initial zone definitions
│   ├── seed_survivors.py   ← Generate starter survivor pool
│   └── test_loot_tables.py ← Loot distribution testing
│
├── 05_deployment/
│   ├── docker-compose.yml  ← Local dev (postgres + redis)
│   ├── docker-compose.prod.yml
│   ├── k8s/                ← Kubernetes manifests for k3s
│   └── electron/
│       └── main.js         ← Electron wrapper for Steam
│
├── 06_gamedata/            ← CREATE THIS FOLDER MANUALLY
│   ├── zones/              ← Zone definition JSON files
│   ├── loot_tables/        ← Drop rate configs per zone type
│   ├── survivors/          ← Name pools, background templates
│   ├── narrative/          ← Fallback event templates
│   └── factions/           ← Faction definitions
│
├── 07_assets/              ← CREATE THIS FOLDER MANUALLY
│   ├── fonts/              ← Monospace font files
│   ├── audio/              ← Ambient sounds, UI events (later)
│   └── ui/                 ← Static UI assets, icons
│
├── 08_design/              ← CREATE THIS FOLDER MANUALLY
│   ├── mockups/            ← Exported UI mockups
│   ├── color_palette.md    ← Locked colour reference
│   └── typography.md       ← Font decisions
│
├── version.json
├── .gitignore
└── README.md               ← Create this
```

---

## Folders to Create Manually

These could not be created by the tooling — create them before M1:

```bash
mkdir -p 06_gamedata/{zones,loot_tables,survivors,narrative,factions}
mkdir -p 07_assets/{fonts,audio,ui}
mkdir -p 08_design/mockups
```
