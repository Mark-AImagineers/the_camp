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
| Backend | FastAPI | Game API, async-native, SSE support |
| Database | PostgreSQL | Game state, survivors, stash, history |
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
                       │ HTTP + SSE
┌─────────────────────────────────────────────────┐
│  FastAPI Backend                                │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  │
│  │ Game     │  │ Expedition   │  │ Narrative │  │
│  │ State API│  │ Engine       │  │ (Claude) │  │
│  └──────────┘  └──────────────┘  └──────────┘  │
│       │                │                        │
│  ┌────┴──────┐  ┌──────┴──────┐                 │
│  │ PostgreSQL│  │    Redis    │                 │
│  └───────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────┘
```

---

## Environment Variables (planned)

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-20250514
ENVIRONMENT=development
```

---

## Key Technical Decisions

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
