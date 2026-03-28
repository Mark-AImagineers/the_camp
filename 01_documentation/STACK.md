# The Camp — Tech Stack

**Version:** 0.1
**Date:** 2026-03-28
**Status:** Locked

---

## Decision

The Camp is a management/narrative game. No physics, no frame-perfect gameplay,
no need for a game engine. The expedition feed is SSE streaming. The inventory
is a drag-and-drop grid. This is a web app with game design on top.

---

## Full Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React + Vite | UI panels, component model, state |
| Styling | Tailwind CSS | Dark theme, utility-first, fast iteration |
| State | Zustand | Client-side game state management |
| Auth | python-jose + passlib | JWT auth, bcrypt password hashing |
| Backend | FastAPI | Game API, async-native, SSE support |
| Database | PostgreSQL + RLS | Game state, survivors, stash, history, data isolation |
| Cache / Queue | Redis | Expedition event queue, real-time dispatch |
| Streaming | SSE (Server-Sent Events) | Expedition narrative feed |
| Narrative | Claude API (Sonnet) | Dynamic expedition event generation |
| Desktop | Electron | Wraps web app for Steam / desktop |
| Infra | Vultr + k3s | Existing homelab infrastructure |

---

## Distribution Targets

| Platform | Method | Priority |
|---|---|---|
| Browser | Direct URL | Primary |
| itch.io | Browser embed or file upload | First publish |
| Steam | Electron wrapper (.exe) | Post-itch, $100 Direct fee |
| iOS App Store | Not targeted | Deprioritised |

---

## Why Not a Game Engine

| Engine | Why excluded |
|---|---|
| Godot 4 | Learning curve; Claude cannot assist natively in editor |
| Pygame | No iOS, no clean Steam path, no UI framework |
| Unity | Overkill, licensing risk, C# |
| Phaser.js | Browser-first only, no clean desktop distribution |

The Camp's mechanics — management panels, text feed, grid inventory — are
solved problems in web UI. A game engine adds complexity with no benefit here.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Electron Shell (Steam / Desktop distribution)  │
│  ┌───────────────────────────────────────────┐  │
│  │  React + Vite Frontend                    │  │
│  │  ┌──────────┐ ┌────────────┐ ┌────────┐  │  │
│  │  │ People   │ │ Expedition │ │ Zones  │  │  │
│  │  │ Panel    │ │ Feed (SSE) │ │ Intel  │  │  │
│  │  └──────────┘ └────────────┘ └────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                       │ HTTP + SSE + JWT
┌─────────────────────────────────────────────────┐
│  FastAPI Backend                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Auth     │  │ Expedition   │  │ Narrative │  │
│  │ + Game   │  │ Engine       │  │ (Claude) │  │
│  │ State API│  │ (server-auth)│  │          │  │
│  └──────────┘  └──────────────┘  └──────────┘  │
│       │                │                        │
│  ┌────┴──────┐  ┌──────┴──────┐                 │
│  │ PostgreSQL│  │    Redis    │                 │
│  │ + RLS     │  │             │                 │
│  └───────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────┘
```

### Data Model

```
user (auth — email, password_hash, tokens)
  └── save_slots (max 3 per user — each is a "player")
        ├── shelter (buildings, upgrades, resources)
        ├── survivors (roster, stats, assignments)
        ├── expeditions (active, history, loot)
        ├── inventory (the vault — items, gear, currency)
        ├── factions (reputation, encounters)
        └── timeline (day counter, events, decisions)
```

RLS policies on all game tables enforce save_slot_id isolation at the DB level.

---

## Environment Variables (planned)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514
ENVIRONMENT=development
SECRET_KEY=<jwt-signing-key>
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
```

---

## Key Technical Decisions

### Authentication — Own infra, no third-party
- FastAPI + python-jose for JWT (access + refresh tokens)
- Password hashing via passlib/bcrypt
- Auth tables live in the same PostgreSQL instance
- No Supabase, no Firebase, no external auth providers
- All infra runs on our homelab

### Data model — User / Save Slot / Game State
- `user` = account (auth, email, password hash)
- `save_slot` = player (max 3 per user). Each slot is a fully independent game life
- All game state (shelter, survivors, inventory, expeditions) belongs to a save slot
- No shared vault across save slots — each slot owns its own economy
- When multiplayer trading lands, trades happen between save slots (player-to-player)

### Server-authoritative hybrid
- **Planning phase**: client-side for snappy UI, no server round-trips needed
- **Expedition resolution**: server-side — server owns outcomes, prevents manipulation
- **All mutations go through the API** — even in single-player, the server validates everything
- Client is a request layer, never an authority. It sends intents, server decides results
- Resource counts, survivor stats, inventory, loot — server tracks, client displays
- If client cache disagrees with server, server wins

### Row-Level Security (RLS) — Data isolation
- Every game table has a `save_slot_id` column
- Postgres RLS policies enforce that queries can only access rows matching the current session's save slot
- FastAPI middleware sets `app.current_save_slot_id` session variable on every request
- Even buggy application code (missed WHERE clause, bad JOIN) cannot leak data across save slots
- Multiplayer trading will be an explicit, controlled exception to the RLS policy

### Multiplayer-ready from day one
- Not multiplayer at launch, but infrastructure assumes it
- Every player action goes through the API — no local-only game logic
- All mutations are logged and idempotent (audit trail for future trading disputes)
- Every endpoint uses `player_id` from JWT, never from client payload
- Trading, raids, alliances = new routes on an already-authoritative server
- No WebSockets, matchmaking, or trade endpoints built now — just the foundation

### SSE for expedition feed
FastAPI async generator streams events to the frontend.
Redis queue holds pending expedition events in order.
Frontend `useExpeditionFeed` hook manages the SSE connection and timing.
Events drip with deliberate delay — silence is gameplay, not lag.

### Claude API as narrative engine
Expedition context (zone, team, gear, seed) sent as structured prompt.
Claude returns a JSON array of timed events with type and decision nodes.
Events are pre-generated at expedition start, then streamed progressively.
Fallback template system activates if API is unavailable.

### Electron for Steam
Steam requires executable files — you cannot submit a URL.
Electron wraps the React app into a native .exe/.app.
The game is unchanged — Steam sees a desktop application.
itch.io gets the browser version; Steam gets the Electron build.
