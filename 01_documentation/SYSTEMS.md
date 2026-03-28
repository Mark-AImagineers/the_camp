# The Camp — Game Systems Reference

**Version:** 0.1
**Date:** 2026-03-28
**Status:** Design phase — not yet implemented

---

## Survivor System

### Generation
Survivors are procedurally generated with:
- First + last name from regional name pools (Filipino, Western, mixed)
- Background archetype (determines stat bias and starting trait)
- Base stats rolled within archetype range, with slight random variance
- One trait assigned from background-appropriate pool

### Background Archetypes

| Background | Stat bias | Trait pool |
|---|---|---|
| Ex-cop | Perception, Endurance | Paranoid, Observant, Protective |
| Farmer | Strength, Endurance | Hardy, Patient, Stubborn |
| Doctor | Luck, Perception | Careful, Empathetic, Methodical |
| Engineer | Strength, Agility | Resourceful, Tinkerer, Focused |
| Kid | Agility, Luck | Lucky, Fast Learner, Reckless |
| Mechanic | Strength, Agility | Resourceful, Stubborn, Handy |
| Merchant | Luck, Perception | Shrewd, Networked, Cautious |

### Stats (1–10 scale)
| Stat | Affects |
|---|---|
| Strength | Carry weight, melee damage, facility build speed |
| Agility | Stealth, dodge chance, extraction speed |
| Perception | Enemy detection, loot quality roll bonus |
| Endurance | Max HP, injury recovery speed, sick resistance |
| Luck | Rare loot multiplier, critical survival rolls |

### Traits (examples)
| Trait | Effect |
|---|---|
| Night Owl | +2 Perception on night runs |
| Paranoid | Detects ambushes early, -1 morale in camp |
| Lucky | +15% to Luck rolls once per run |
| Protective | Takes damage for teammates in same zone |
| Stubborn | Ignores extraction threshold 20% of the time |
| Reckless | +20% aggression in combat, -15% survival chance |
| Methodical | Slower runs, +10% loot quality, fewer injuries |

### Relationships
Survivors form relationships organically based on:
- Shared expedition outcomes (surviving together = positive bond)
- Time spent in same camp role
- Random "event" triggers (campfire conversation, argument, etc.)

When a bonded survivor dies, the surviving partner suffers:
- -2 morale for 3 days
- Reduced stats on next run (grief modifier)
- A relationship flag in their record forever

---

## Expedition System

### Zone Parameters

Each zone has:
```json
{
  "id": "eastfield_mall",
  "name": "Eastfield Mall",
  "threat_level": "medium",
  "objective_types": ["scavenge", "retrieve"],
  "loot_pool": "urban_commercial",
  "modifiers": [],
  "max_loot_tier": "legendary",
  "time_limit_minutes": 120,
  "intel_level": "partial"
}
```

### Threat Levels
| Level | Enemy density | Encounter chance | Injury chance |
|---|---|---|---|
| Low | Sparse | 30% | 10% |
| Medium | Moderate | 55% | 25% |
| High | Dense | 75% | 45% |
| Extreme | Overwhelming | 90% | 70% |

### Zone Modifiers (stackable)
| Modifier | Effect |
|---|---|
| Fog | Perception -3, surprise chance +20% |
| Horde night | Enemy density ×2, encounter chance 95% |
| Irradiated | Endurance check each hour or sick, loot +1 tier |
| Raider-held | Human enemies — smarter, better gear, will counter-extract |

### Expedition Resolution

Each expedition tick processes:
1. Movement event (zone area traversal)
2. Encounter roll (vs threat level + modifiers)
3. If encounter: combat or stealth resolution
4. Loot opportunity roll (vs Perception + zone loot pool)
5. Status checks (health, ammo, medkits)
6. Extraction threshold evaluation
7. Special event roll (survivor dialogue, discoveries, random events)

Combat resolution:
```
survival_chance = (team_avg_combat_stat + gear_bonus) / (threat_rating + modifier_penalty)
outcome = weighted_random(survived, injured, critical, dead)
```

---

## Loot System

### Rarity Thresholds
```python
RARITY_WEIGHTS = {
    "common":     60.0,
    "uncommon":   25.0,
    "rare":       12.0,
    "legendary":   2.5,
    "mythic":      0.5,
}
```

Perception stat adds a flat bonus to rare+ rolls.
Luck stat applies a multiplier to legendary+ rolls.
Zone loot tier cap hard-limits what can drop.

### Loot Pools

Pools are tagged by zone type:
- `urban_commercial` — food, medicine, clothing, electronics
- `military_base` — weapons, ammo, armour, tactical gear
- `hospital` — medicine, surgical tools, lab equipment
- `residential` — food, household tools, comfort items
- `industrial` — crafting materials, fuel, heavy equipment

### Affixes

Each item beyond Common gets 1–3 random affixes:
```
[Hunting Rifle] (Rare)
  + Scope: +2 Perception on ranged
  + Worn: -5% durability per run
  + Silenced: -30% noise on discharge
```

Affix pools are item-type specific. Weapons get combat affixes.
Armour gets defensive affixes. Tools get utility affixes.

---

## Camp System

### Facilities

| Facility | Max level | Effect per level |
|---|---|---|
| Farm | 3 | +5 food/day |
| Clinic | 3 | +1 recovery/day per injured survivor |
| Workshop | 3 | Unlock crafting recipes |
| Guard Post | 3 | -15% raid damage |
| Radio Tower | 2 | +1 zone intel revealed per day |
| Storage | 3 | +10 stash slots |

### Resource Tick (daily)
```
food -= population × 1
food += farmers × farm_level × 5
medicine -= injured_count × 0.5
morale += (healthy_survivors / population) × 2
morale -= (deaths_this_week) × 5
```

### Raid Events
Triggered randomly when:
- Camp morale is high (attracts attention)
- Zone nearby was cleared (displaced enemies)
- Faction reputation drops below threshold

Raid outcome determined by:
- Guard count + guard post level vs raid size
- Equipment of guards
- Losses applied to camp resources and potentially survivors

---

## Narrative Engine

### Prompt Structure

At expedition start, the backend sends to Claude API:

```json
{
  "zone": { "name": "...", "threat": "...", "modifiers": [...] },
  "team": [
    {
      "name": "Marcus C.",
      "background": "Ex-cop",
      "stats": { "strength": 7, "agility": 5, "perception": 8, ... },
      "trait": "Paranoid",
      "condition": "Healthy",
      "gear": ["Hunting Rifle (Rare)", "Medkit ×1", "Body Armour (Common)"]
    }
  ],
  "objective": "scavenge",
  "behavior_priority": "stealth",
  "extraction_threshold": 30,
  "seed": 839201
}
```

### Expected Response

```json
{
  "events": [
    { "type": "normal", "delay_seconds": 4, "text": "Team inserted. Visibility low." },
    { "type": "warning", "delay_seconds": 12, "text": "Movement detected. East corridor." },
    {
      "type": "decision",
      "delay_seconds": 3,
      "prompt": "Marcus spots a raider camp ahead. Push through or reroute?",
      "options": ["Push through", "Reroute north", "Extract now"],
      "timeout_seconds": 30,
      "default_on_timeout": 1
    },
    { "type": "loot", "delay_seconds": 8, "text": "Antibiotics ×4 found.", "rarity": "rare" },
    { "type": "good", "delay_seconds": 6, "text": "Team extracted. All clear." }
  ]
}
```

### Fallback Template System

If Claude API is unavailable, the expedition engine uses a weighted
template pool per zone type. Less unique but functionally equivalent.
Templates are stored in `06_gamedata/narrative/`.

---

## Death & Memory

When a survivor dies:
1. `condition` set to `dead`, `death_date` recorded
2. `death_expedition_id` linked to the run record
3. Portrait rendered greyscale in all UI forever
4. `relationship_death_event` triggered for all bonded survivors
5. Entry written to `camp_history` table
6. Survivor remains in `survivors` table — never deleted

The camp history is a permanent log:
```
Day 14 — Danny K. (Raider) did not return from the Industrial District.
         He had been with us since Day 3.
```

This log is viewable in the Camp tab and is the game's emotional record.
