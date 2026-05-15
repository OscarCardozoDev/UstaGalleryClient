# Games Module — Color Mixing Game Design

**Date:** 2026-04-22  
**Branch:** `features/games`  
**Scope:** Frontend only, no backend dependency

---

## Overview

New "Práctica" section in the student dashboard. First game: **Color Mixing** — student sees a named target color and mixes Rojo, Amarillo, Azul (RYB model) to match it as closely as possible. Three difficulty levels with distinct win conditions.

---

## Architecture

### Routing

New routes added to `DashboardModule`:

| Path | Component |
|------|-----------|
| `/dashboard/games` | `GamesHub` — catalog of available games |
| `/dashboard/games/color-mixing` | `ColorMixingGame` — the game |

`GamesModule` registered in `src/pages/dashboard/routes.tsx` with lazy loading.

### Sidebar

New "Práctica" item visible to all roles (student, professor, admin). Links to `/dashboard/games`.

### File Structure

```
src/pages/dashboard/pages/Games/
├── index.tsx
├── routes.tsx
├── GamesHub/
│   └── GamesHub.tsx
└── ColorMixing/
    ├── ColorMixingGame.tsx
    ├── hooks/
    │   └── useColorMixingGame.ts
    ├── components/
    │   ├── LevelSelector.tsx
    │   ├── ColorMixer.tsx
    │   ├── TargetColor.tsx
    │   ├── RoundTimer.tsx
    │   ├── ScoreDisplay.tsx
    │   └── ResultScreen.tsx
    └── utils/
        └── ryb.ts
```

---

## Game Mechanics

### Color Model

RYB (traditional paint model). Three base components: Rojo (R), Amarillo (Y), Azul (B), each 0–100.

`ryb.ts` exposes two pure functions:

- `rybToHex(r: number, y: number, b: number): string` — converts RYB to HEX for visual rendering
- `rybDistance(a: RYBColor, b: RYBColor): number` — normalized Euclidean distance [0, 1]

### Target Colors

~30 named colors hardcoded in `ryb.ts` (no backend). Examples: naranja, verde, violeta, ocre, terracota, carne, oliva, magenta, turquesa, siena. Selected randomly each round without repetition within a session.

### Scoring

```
score = 10 - (rybDistance(mixed, target) * 10)
```

Range: 0.0–10.0, one decimal place displayed.

### Difficulty Levels

| Level | End condition | Goal |
|-------|--------------|------|
| **Fácil** | 5 fixed rounds | Highest accumulated score |
| **Medio** | 60-second timer | Most rounds completed |
| **Difícil** | Score < 7.0 on any round = game over | Survive as many rounds as possible |

---

## State Machine (`useColorMixingGame`)

```
idle → selecting-level → playing → round-end → game-over
                                  ↑___________↓  (loop until end condition)
```

**State shape:**
```ts
{
  phase: 'idle' | 'selecting-level' | 'playing' | 'round-end' | 'game-over'
  level: 'easy' | 'medium' | 'hard' | null
  round: number
  score: number          // accumulated
  lastRoundScore: number // score for most recent round
  timeLeft: number       // seconds, Medium mode only
  targetColor: RYBColor & { name: string }
  mix: RYBColor          // current student input
}
```

**Actions:**
- `selectLevel(level)` — transitions to `playing`, picks first target
- `setMix(r, y, b)` — updates mix in real time (no submission yet)
- `confirmMix()` — calculates score, transitions to `round-end`; if Hard and score < 7.0 → `game-over`
- `nextRound()` — picks next target, transitions to `playing`; if Easy and round === 5 → `game-over`
- `restart()` → `selecting-level`

---

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `GamesHub` | Grid of game cards; each card shows name, description, difficulty tags |
| `LevelSelector` | 3 cards (Fácil/Medio/Difícil) with rule summary; calls `selectLevel` |
| `TargetColor` | Displays target color swatch + name |
| `ColorMixer` | 3 labeled sliders (R/Y/B) + live preview swatch of mixed color |
| `ScoreDisplay` | Current round number, accumulated score, lives/timer per mode |
| `RoundTimer` | Countdown ring/bar, Medium mode only; triggers `game-over` on 0 |
| `ResultScreen` | Final score, rounds survived, performance label, restart/change-level buttons |

---

## Data Flow

```
useColorMixingGame()
  └── ColorMixingGame.tsx
        ├── <LevelSelector />        phase: selecting-level
        ├── <TargetColor />          phase: playing
        ├── <ColorMixer />           phase: playing
        ├── <ScoreDisplay />         phase: playing
        ├── <RoundTimer />           phase: playing + level: medium
        ├── round-end feedback       phase: round-end (inline, no separate component)
        └── <ResultScreen />         phase: game-over
```

No Context, no global state. All state flows down from `useColorMixingGame` via props.

---

## Constraints

- Zero backend calls — fully offline capable
- No score persistence — shown only at session end
- RYB math must be self-contained in `ryb.ts`
- Follows existing dashboard module patterns (lazy loading, same layout wrapper)
- Deployed exclusively on branch `features/games`
