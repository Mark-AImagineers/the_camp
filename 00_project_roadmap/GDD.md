# The Camp — Game Design Document

**Version:** 0.1 (Pre-production)
**Date:** 2026-03-28
**Status:** Concept locked, prototype pending

---

## One-liner

A post-apocalyptic shelter management game where you plan, then lose control — and live with what comes back.

---

## Vision

You are not a hero. You are a leader.

You manage a survivor camp in a collapsed world. You assign roles, plan expeditions, equip your people — then you send them out and lose all control. The narrative plays out without you. You wait. You find out what happened.

The emotional hook is not loot. It is people. When Marcus doesn't come back, that is not a game mechanic. That is a story. And the player wrote it.

---

## Tone & References

| Reference | What we take from it |
|---|---|
| Darkest Dungeon | Consequence, roster weight, permanent loss |
| FTL | Calculated decisions, permadeath that stings |
| Fallout Shelter | Shelter loop — but deeper, not a skinner box |
| Zork / MUD | Text as the primary experience |
| Tarkov | Dread, scarcity, weight of every decision |

**NOT:** Diablo (loot showers), idle clickers (no consequence), FPS (no direct combat control)

---

## Core Fantasy

You are the manager of the last people you have left.
You plan. You decide. The run executes.
You watch. You live with the outcome.

---

## Core Loop

```
CAMP → PLAN EXPEDITION → DEPLOY → NARRATIVE PLAYS OUT → RESULTS → ADAPT → REPEAT
  ↑                                                                        |
  └─────────── survivors return (or don't), loot secured ─────────────────┘
```

### Phase 1 — Camp Management (full player control)
- Assign roles to survivors
- Monitor resources: food, medicine, morale, population
- Manage facilities: farm, clinic, workshop, guard post
- Review intel: zone reports, contracts, radio chatter
- Equip and prepare expedition teams from stash

### Phase 2 — Expedition Planning (full player control)
- Select zone (threat level, known intel, loot type)
- Choose team members (stats, traits, condition all matter)
- Load gear into grid inventory (weight limits, real tradeoffs)
- Set extraction threshold rules ("extract if health < 30%")
- Set behavior priority: stealth / aggro / balanced
- Click DEPLOY — player loses control here, no exceptions

### Phase 3 — The Run (no player control)
- Expedition events stream in real-time via narrative feed
- Events drip with deliberate timing — silence is part of the tension
- Occasional decision prompts pause the feed (timed, must respond)
- The only intervention available is EXTRACT — always visible
- Combat, loot, encounters resolve via stats + gear + weighted randomness

### Phase 4 — Results
- Team returns with loot, injuries, trauma — or doesn't
- Stash updated with extracted items
- Morale affected by outcomes, especially deaths
- Dead survivors remain in roster permanently, greyed out

---

## People System

Every survivor is a named individual, not a unit.

| Attribute | Description |
|---|---|
| Name | Procedurally generated — feels real |
| Background | Ex-cop / Farmer / Doctor / Engineer / Kid / Mechanic / etc. |
| Stats | Strength, Agility, Perception, Endurance, Luck (1–10 each) |
| Trait | One unique modifier — Night Owl, Paranoid, Lucky, Protective, Stubborn |
| Condition | Healthy / Injured / Sick / Traumatized / Dead |
| Role | Assigned camp or expedition role |
| Relationships | Who they are close to — death hits harder through these |

### Camp Roles
| Role | Effect |
|---|---|
| Farmer | Food production per day |
| Medic | Heals injured survivors, reduces sick duration |
| Engineer | Builds and repairs camp facilities |
| Guard | Reduces incoming raid damage |
| Merchant | Improves trade efficiency |
| Trainer | Slowly improves others' stats over time |

### Expedition Roles
| Role | Risk | Primary reward |
|---|---|---|
| Scout | Low | Zone mapping, finds new survivors |
| Scavenger | Medium | Loot runs — materials and gear |
| Raider | High | Clears zones, rare gear drops |
| Rescuer | Medium | Finds and retrieves new survivors |

### Death
- Portrait goes greyscale in the roster permanently
- Name logged in camp history — never removed
- Relationships trigger morale penalties for connected survivors
- Their last expedition log entry is preserved
- The greyed portrait is the emotional core of the UI

---

## Expedition Feed

The text feed is the heart of the game.

Events drip in with timing — silence is deliberate:

```
[08:02] Elena and Marcus inserted. Eastfield Mall. Visibility: low.

[08:19] Ground floor cleared. No contacts.

[08:34] ⚠ Movement detected. East stairwell. Unconfirmed.

[08:41] Marcus is checking the stairwell. Elena is holding position.

[08:47] Contact. Two infected. Marcus engaged.

[08:49] Marcus took a hit. Health: 41%.

[08:51] Elena applied a field dressing. 1 medkit used.

[09:04] Pharmacy found. Gate is padlocked.

⚠ DECISION: Marcus wants to shoot the lock. Elena says that's stupid.
  [ Shoot it ]  [ Find another way ]  [ Extract now ]

[09:18] ★ Antibiotics ×4 — Rare find.
```

### Timing
- Normal events: 3–8 second gap
- Warning events: shorter gap before and after — builds tension
- Decision prompts: always preceded by 2–3 seconds of silence
- After decision: 1–2 second pause before narrative resumes
- No map. No visibility. Just the feed. That is the point.

### Event generation
- Narrative engine pre-generates full event sequence via Claude API at expedition start
- Zone context, team stats, gear loadout, and random seed sent as structured prompt
- Response is a JSON array of timed events with types and decision nodes
- Fallback: template-based event system if API unavailable

---

## Loot System

### Rarity Tiers

| Tier | Indicator | Drop rate | Player feel |
|---|---|---|---|
| Common | — | 60% | Useful noise |
| Uncommon | + | 25% | Mild interest |
| Rare | ★ | 12% | Stop and look |
| Legendary | ★★ | 2.5% | Real moment |
| Mythic | ★★★ | 0.5% | Screen event |

### Loot Philosophy
Not showers. Scarcity. Every item is meaningful:
- A working flashlight is a find
- 9mm ammo ×12 — you count every round
- Antibiotics — you have been saving space for these
- A military backpack — changes your carry capacity
- A suppressor — changes how you play

Rare does not mean sparkly. It means you have never seen one before and you know exactly what it is worth.

### Affixes
Gear has random modifiers — a well-rolled Rare can outperform a Legendary. Every drop is worth evaluating. The grind stays interesting.

---

## Resource System

| Resource | Produced by | Consumed by | If depleted |
|---|---|---|---|
| Food | Farmers, scavengers | Everyone, daily | Starvation, morale collapse |
| Medicine | Scavengers, merchants | Medics, injuries | Injuries compound, deaths |
| Morale | Good outcomes, rest | Deaths, hunger | Role refusals, desertion |
| Population | Rescue missions | Deaths | Fewer workers, fewer teams |

The camp has needs that create urgency. You cannot play it safe forever.

---

## Zone System

Each zone is a procedurally parameterised run:

| Property | Options |
|---|---|
| Threat level | Low / Medium / High / Extreme |
| Objective | Scavenge / Rescue / Clear / Retrieve |
| Modifiers | Fog / Horde night / Irradiated / Raider-held |
| Loot tier cap | Limits maximum drop quality |
| Time pressure | Darkness falls — overstay escalates threat |

Modifiers stack. Higher risk = higher reward multiplier. A fog + irradiated zone is a different game.

---

## Permadeath Rules

- Everything equipped on a run is at risk
- Die in a zone = lose equipped gear + all found loot that run
- **Stash is sacred** — banked items are never at risk
- This forces the real question every run: do I bring my good gear?

---

## Meta Progression

Permadeath wipes your run gear. Progression lives in:

| Layer | What persists |
|---|---|
| Banked stash | Items extracted safely |
| Crafting recipes | Unlocked permanently |
| Camp facilities | Built structures survive |
| Reputation | Faction standing, better contracts |
| Camp history | The full record of everyone who lived and died |

---

## Late Game Vision

- Multiple teams running simultaneously in different zones
- Factions that react to your reputation and actions
- Zones that degrade or evolve over time
- Other survivor camps to trade with, ally with, or raid
- World difficulty escalates regardless of player progress — time pressure is always on

---

## What Makes This Different

- No loot showers — meaningful scarcity
- No direct combat control — consequence of planning, not execution skill
- People feel real — names, traits, relationships, permanent death record
- The silence is the tension — feed pacing IS the gameplay
- AI-generated narrative — every run tells a different story
- The greyed portrait stays forever — the game remembers who you lost
