# The Camp — UI Specification

**Version:** 0.1
**Date:** 2026-03-28
**Status:** Layout approved, implementation pending

---

## Philosophy

The UI is the game. There is no 3D world. The interface is what the player
sees and feels. It must communicate dread, attachment, weight, and tension
without saying any of those words.

Reference: Zork / MUD layout. The text feed is the soul.
Everything else is supporting context.

---

## Visual Language

### Colour Palette

```
Background primary:    #0d0d0d
Background secondary:  #111111
Background elevated:   #1a1a1a
Border default:        #2a2a2a
Border subtle:         #1a1a1a

Text primary:          #c9b99a   ← warm aged paper
Text secondary:        #7a6a54
Text muted:            #4a3d2e
Text dead:             #3a3a3a   ← greyed portrait text

Accent amber:          #ba7517   ← warnings, decisions, ⚠
Accent danger:         #993c1d   ← critical health, deaths
Accent rare:           #185fa5   ← rare+ loot (used nowhere else)
Accent safe:           #639922   ← healthy, good outcomes
```

### Typography
- Monospace throughout — `font-family: monospace`
- Expedition feed: 11–12px, terminal feel
- Survivor names: same font, brighter — human, impermanent
- No rounded fonts. Nothing friendly.
- All labels sentence case.

### Borders & Shape
- 1px solid #2a2a2a on all panels
- `border-radius: 3px` — minimal, not soft
- No shadows, no gradients, no glow effects

---

## Layout — Three Column Grid

```
┌──────────────────────────────────────────────────────────────────┐
│ TOPBAR — title · food · medicine · morale · population · day     │
├────────────────┬─────────────────────────────┬───────────────────┤
│                │                             │                   │
│  LEFT PANEL    │   CENTER — EXPEDITION FEED  │   RIGHT PANEL     │
│  220px fixed   │   1fr (fills remaining)     │   200px fixed     │
│                │                             │                   │
│  Tabs:         │   header: team + zone       │   Tabs:           │
│  [People]      │                             │   [Zones]         │
│  [Stash]       │   text event stream         │   [Intel]         │
│  [Camp]        │   timestamped, drip-fed     │                   │
│                │   decision prompts          │   zone cards      │
│  survivor list │   rare drop callouts        │                   │
│  portraits     │                             │   active team     │
│  health bars   │                             │   quick stats     │
│  status badges │                             │                   │
│                │                             │                   │
├────────────────┴─────────────────────────────┴───────────────────┤
│ BOTTOM BAR — contextual status message · primary action button   │
└──────────────────────────────────────────────────────────────────┘
```

CSS grid:
```css
grid-template-columns: 220px 1fr 200px;
grid-template-rows: 32px 1fr 48px;
gap: 2px;
height: 100vh;
background: #0d0d0d; /* gap colour */
```

---

## Component Specs

### TopBar
- Height: 32px, background #0d0d0d
- Left: `THE CAMP` — 11px, letter-spacing 0.2em, muted amber #6b5c45
- Centre: resource indicators — coloured dot + label + value
  - Food dot: #639922 (green)
  - Medicine dot: #185fa5 (blue) — value turns red if critically low
  - Morale dot: #ba7517 (amber)
  - Population dot: #533b2a (brown)
- Right: `DAY N` — muted, right-aligned
- Bottom border: 1px #1e1e1e

### Left Panel — People tab (default)

Survivor row (each person):
- 28×28px portrait square — initials, dark background, 1px border
  - **Dead survivors:** greyscale, name text has `text-decoration: line-through`, colour #3a3a3a
- Name (11px, #c9b99a) + Role + assignment (10px, #4a3d2e)
- Health bar: 3px height, green → amber → red based on HP %
- Status badge (right): `Healthy` / `Injured` / `Out` / `KIA`
  - KIA: no background, colour #3a3a3a — just the word

Dead survivors stay in the roster permanently at the bottom.
Their greyed portrait is the emotional design of the game.

### Left Panel — Stash tab
- Grid inventory — drag and drop
- Item cards with rarity colour on left border:
  - Common: #444441
  - Uncommon: #3b6d11
  - Rare: #185fa5
  - Legendary: #ba7517
  - Mythic: #534ab7
- Weight indicator at bottom of panel

### Left Panel — Camp tab
- Facility list with level indicator
- Resource production rates per day
- Build/upgrade queue

### Center Panel — Expedition Feed

Header:
- Team name + zone name + elapsed time
- Background #1a1a1a, border-bottom 1px #2a2a2a

Feed body:
- Monospace, 11px, auto-scroll as events append
- New events at bottom

Event format:
```
[HH:MM] Event text here.
```

Event colours:
```
Normal:   #7a6a54
Warning:  #ba7517   (⚠ prefix)
Danger:   #993c1d
Good:     #639922
Rare:     #185fa5   ← used only for rare+ drop notifications
```

Decision prompt:
```
┌── amber border (#3a2e00 bg) ──────────────────────┐
│ ⚠ Situation description. What does the team do?  │
│ [ Option A ]  [ Option B ]  [ Option C ]          │
└───────────────────────────────────────────────────┘
```
- Pauses the feed
- Buttons: small, monospace, dark — no visual hint which is "right"
- Always timed — player must respond or team decides autonomously

Timing (drip effect):
- Normal events: 3–8 second gap
- Warning events: shorter gap before and after
- Decision prompts: 2–3 second silence beforehand
- Post-decision: 1–2 second pause then feed resumes

No map. No minimap. No visibility. Just the feed.

### Right Panel — Zones tab

Zone cards (available contracts):
- Zone name (11px, #9a8a6a)
- Threat indicator: coloured pip + label
  - Low: #639922
  - Medium: #ba7517
  - High: #993c1d
  - Extreme: #534ab7
- Loot type hint
- Click to select zone for planning

### Right Panel — Active Team section (during run)

Quick stats for the team currently in the field:
- Each member: name + HP %
- Bag fill %
- Ammo count
- Medkits remaining

Turns red when critical. Always visible during active run.

### Bottom Bar
- Height: 48px, background #0d0d0d, border-top 1px #1e1e1e
- Left: contextual status message (10px, muted)
  - "Marcus is injured — consider extraction"
  - "Medicine critically low — prioritise medical zone"
- Right: primary action button
  - During run: `EXTRACT TEAM` — amber border, amber text
  - Planning phase: `DEPLOY` — same treatment, heavier weight

---

## Emotional Design Notes

The interface should feel like a field operations terminal from a world
that has been running on improvised power for three years.

Everything is functional. Nothing is decorative.
The only colour with warmth is the amber of warnings and decisions —
because those are the moments that matter.

The rare drop colour (blue #185fa5) appears nowhere else in the UI.
When it shows up in the feed, the player's eye goes straight to it.
That moment is the dopamine hit. Guard it.

The greyed portrait at the bottom of the People panel is the
most important pixel in the game. It does not move. It does not animate.
It just stays there. The player put it there by sending that person out.
