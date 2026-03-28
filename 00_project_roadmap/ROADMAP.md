# The Camp — Project Roadmap

**Version:** 0.1
**Date:** 2026-03-28
**Status:** Pre-production

---

## Milestones

### M0 — Foundation (current)
- [x] Game concept locked
- [x] Title confirmed: The Camp
- [x] Core loop designed
- [x] Tech stack decided
- [x] UI layout approved
- [x] Folder structure created
- [x] Documentation written
- [x] Repo initialised with base project files
- [x] Auth & data architecture decided (own infra, JWT, RLS, server-authoritative hybrid)
- [ ] Database schema designed
- [ ] Local dev environment running

### M1 — Prototype (text only)
Goal: feel the loop before building the visual layer.

- [ ] FastAPI backend scaffold
- [ ] Auth system — registration, login, JWT tokens, refresh flow
- [ ] Save slot system — create/select/delete (max 3 per user)
- [ ] PostgreSQL schema — users, save_slots, survivors, stash, expeditions, camp_state
- [ ] RLS policies on all game tables (save_slot_id isolation)
- [ ] Survivor generator (procedural names, stats, traits)
- [ ] Zone definition loader (JSON/YAML)
- [ ] Basic expedition engine (event resolution, no Claude API yet)
- [ ] Template-based narrative feed (hardcoded event pool)
- [ ] React frontend scaffold
- [ ] Three-panel layout wired up
- [ ] SSE hook — expedition feed rendering in real time
- [ ] People panel — roster with health bars, status badges
- [ ] Decision prompt component
- [ ] Extract button — functional

**Milestone complete when:** A full expedition runs from deploy to extract with a readable narrative feed.

### M2 — Living Camp
Goal: the camp feels alive between runs.

- [ ] Resource system — food, medicine, morale, population
- [ ] Role assignment — drag survivors to roles
- [ ] Camp facilities — farm, clinic, workshop (level 1 each)
- [ ] Day/night cycle — resource tick
- [ ] Stash panel — grid inventory, drag and drop
- [ ] Loot tables — full rarity system with affixes
- [ ] Death system — greyed portraits, morale penalties, history log

**Milestone complete when:** Camp degrades if you don't run expeditions.

### M3 — Narrative Engine
Goal: every run tells a unique story.

- [ ] Claude API integration — narrative engine service
- [ ] Structured event JSON schema
- [ ] Prompt template system — zone + team + gear → event sequence
- [ ] Fallback template system (offline/API failure)
- [ ] Decision prompt generation — context-aware choices
- [ ] Run history log — full narrative saved per expedition

**Milestone complete when:** Two runs to the same zone feel meaningfully different.

### M4 — World & Factions
Goal: the world outside the camp has memory.

- [ ] Zone intel system — scouted vs unknown
- [ ] Zone degradation — cleared zones repopulate over time
- [ ] Faction system — reputation, standing, contract tiers
- [ ] Trader NPC — exchange loot for resources
- [ ] Raid events — outside threats attack the camp

### M5 — Polish & Distribution
Goal: shippable on itch.io.

- [ ] Full sound design (ambient, UI, rare drop event)
- [ ] Pixel art portraits — 32×48px per background type
- [ ] Onboarding — first run guided narrative
- [ ] Settings — font size, feed speed, accessibility
- [ ] itch.io page + build upload
- [ ] Electron wrapper — Steam-ready .exe

---

## Current Focus

**M0 → M1 transition**
Next session: database schema + FastAPI scaffold.
