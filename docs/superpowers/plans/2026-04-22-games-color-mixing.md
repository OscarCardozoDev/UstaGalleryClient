# Games Module — Color Mixing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/dashboard/games` section with a RYB color mixing game that has three difficulty levels (Easy/Medium/Hard), fully frontend-only, no backend dependency.

**Architecture:** Hook-driven state machine (`useColorMixingGame`) owns all game logic; components are pure renderers receiving state + actions as props. Pure utility functions in `ryb.ts` handle color math (RYB→HEX conversion and distance scoring). GamesHub acts as a catalog landing page for future games.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, CSS Modules, Vitest (added in Task 1 for unit tests on pure functions)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add vitest + @vitest/ui devDependencies |
| `vite.config.ts` | Modify | Add vitest test config block |
| `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.ts` | Create | RYB types, color list, rybToHex, rybDistance |
| `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.test.ts` | Create | Unit tests for rybToHex and rybDistance |
| `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.ts` | Create | Game state machine hook |
| `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.test.ts` | Create | Unit tests for game logic |
| `src/pages/dashboard/pages/Games/GamesHub/GamesHub.tsx` | Create | Landing page listing available games |
| `src/pages/dashboard/pages/Games/GamesHub/GamesHub.module.css` | Create | Styles for GamesHub |
| `src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.tsx` | Create | Difficulty picker cards |
| `src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.module.css` | Create | LevelSelector styles |
| `src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.tsx` | Create | Target color swatch + name display |
| `src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.module.css` | Create | TargetColor styles |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.tsx` | Create | 3 RYB sliders + live preview |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.module.css` | Create | ColorMixer styles |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.tsx` | Create | Round/score/timer stats bar |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.module.css` | Create | ScoreDisplay styles |
| `src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.tsx` | Create | Countdown bar for Medium mode |
| `src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.module.css` | Create | RoundTimer styles |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.tsx` | Create | Final score screen |
| `src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.module.css` | Create | ResultScreen styles |
| `src/pages/dashboard/pages/Games/ColorMixing/ColorMixingGame.tsx` | Create | Assembles all components using the hook |
| `src/pages/dashboard/pages/Games/ColorMixing/ColorMixingGame.module.css` | Create | Main game page styles |
| `src/pages/dashboard/pages/Games/routes.tsx` | Create | Games sub-routes |
| `src/pages/dashboard/pages/Games/index.tsx` | Create | GamesModule entry point |
| `src/pages/dashboard/routes.tsx` | Modify | Add games route |
| `src/pages/dashboard/components/Siderbar/Sidebar.tsx` | Modify | Add "Práctica" nav item |

---

## Task 1: Branch setup and Vitest configuration

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`

- [ ] **Step 1: Create and switch to the feature branch**

```bash
cd UstaGallery
git checkout -b features/games
```

Expected: `Switched to a new branch 'features/games'`

- [ ] **Step 2: Install Vitest and jsdom**

```bash
bun add -d vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test config to `vite.config.ts`**

Replace the entire file with:

```typescript
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    watch: {
      usePolling: true
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
})
```

- [ ] **Step 4: Add test script to `package.json`**

In the `"scripts"` section, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify Vitest works**

```bash
bun run test
```

Expected: `No test files found` (passes with 0 tests — not an error)

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts package.json bun.lockb
git commit -m "chore: add vitest for unit testing"
```

---

## Task 2: RYB utility functions

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.ts`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { rybToHex, rybDistance, TARGET_COLORS } from './ryb'

describe('rybToHex', () => {
  it('pure red returns red-ish hex', () => {
    const hex = rybToHex(100, 0, 0)
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
    // red channel should dominate
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeLessThan(100)
  })

  it('pure yellow returns yellow-ish hex', () => {
    const hex = rybToHex(0, 100, 0)
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeGreaterThan(200)
    expect(b).toBeLessThan(100)
  })

  it('pure blue returns blue-ish hex', () => {
    const hex = rybToHex(0, 0, 100)
    const b = parseInt(hex.slice(5, 7), 16)
    expect(b).toBeGreaterThan(150)
  })

  it('returns #ffffff for (0,0,0)', () => {
    expect(rybToHex(0, 0, 0)).toBe('#ffffff')
  })

  it('always returns valid 6-char hex', () => {
    expect(rybToHex(50, 50, 50)).toMatch(/^#[0-9a-f]{6}$/)
    expect(rybToHex(100, 100, 100)).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('rybDistance', () => {
  it('identical colors have distance 0', () => {
    expect(rybDistance({ r: 50, y: 30, b: 20 }, { r: 50, y: 30, b: 20 })).toBe(0)
  })

  it('maximum distance between (0,0,0) and (100,100,100) is 1', () => {
    const d = rybDistance({ r: 0, y: 0, b: 0 }, { r: 100, y: 100, b: 100 })
    expect(d).toBeCloseTo(1, 5)
  })

  it('distance is symmetric', () => {
    const a = { r: 80, y: 10, b: 40 }
    const b = { r: 20, y: 90, b: 5 }
    expect(rybDistance(a, b)).toBeCloseTo(rybDistance(b, a), 10)
  })

  it('distance is between 0 and 1', () => {
    const d = rybDistance({ r: 100, y: 0, b: 0 }, { r: 0, y: 0, b: 100 })
    expect(d).toBeGreaterThanOrEqual(0)
    expect(d).toBeLessThanOrEqual(1)
  })
})

describe('TARGET_COLORS', () => {
  it('has at least 10 colors', () => {
    expect(TARGET_COLORS.length).toBeGreaterThanOrEqual(10)
  })

  it('each color has name, r, y, b in [0, 100]', () => {
    for (const color of TARGET_COLORS) {
      expect(typeof color.name).toBe('string')
      expect(color.r).toBeGreaterThanOrEqual(0)
      expect(color.r).toBeLessThanOrEqual(100)
      expect(color.y).toBeGreaterThanOrEqual(0)
      expect(color.y).toBeLessThanOrEqual(100)
      expect(color.b).toBeGreaterThanOrEqual(0)
      expect(color.b).toBeLessThanOrEqual(100)
    }
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test
```

Expected: `FAIL` — cannot find module `./ryb`

- [ ] **Step 3: Implement `ryb.ts`**

Create `src/pages/dashboard/pages/Games/ColorMixing/utils/ryb.ts`:

```typescript
export interface RYBColor {
  r: number // 0–100
  y: number // 0–100
  b: number // 0–100
}

export interface NamedColor extends RYBColor {
  name: string
}

function cubicInt(t: number, a: number, b: number): number {
  return a + (b - a) * t * t * (3 - 2 * t)
}

// Trilinear interpolation through RYB color cube.
// Based on Gossett & Chen paint-mixing model.
function rybToRgb(r: number, y: number, b: number): [number, number, number] {
  const rn = r / 100
  const yn = y / 100
  const bn = b / 100

  let x0 = cubicInt(bn, 1.0, 0.163)
  let x1 = cubicInt(bn, 1.0, 0.0)
  let x2 = cubicInt(bn, 1.0, 0.5)
  let x3 = cubicInt(bn, 1.0, 0.2)
  let y0 = cubicInt(yn, x0, x1)
  let y1 = cubicInt(yn, x2, x3)
  const red = cubicInt(rn, y0, y1)

  x0 = cubicInt(bn, 1.0, 0.373)
  x1 = cubicInt(bn, 1.0, 0.66)
  x2 = cubicInt(bn, 0.0, 0.0)
  x3 = cubicInt(bn, 0.5, 0.094)
  y0 = cubicInt(yn, x0, x1)
  y1 = cubicInt(yn, x2, x3)
  const green = cubicInt(rn, y0, y1)

  x0 = cubicInt(bn, 1.0, 0.6)
  x1 = cubicInt(bn, 0.0, 0.2)
  x2 = cubicInt(bn, 0.0, 0.5)
  x3 = cubicInt(bn, 0.0, 0.0)
  y0 = cubicInt(yn, x0, x1)
  y1 = cubicInt(yn, x2, x3)
  const blue = cubicInt(rn, y0, y1)

  return [
    Math.round(Math.min(1, Math.max(0, red)) * 255),
    Math.round(Math.min(1, Math.max(0, green)) * 255),
    Math.round(Math.min(1, Math.max(0, blue)) * 255),
  ]
}

export function rybToHex(r: number, y: number, b: number): string {
  const [rr, gg, bb] = rybToRgb(r, y, b)
  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`
}

// Normalized Euclidean distance in RYB space. Returns [0, 1].
// Max possible distance = sqrt(100² + 100² + 100²) = ~173.2
const MAX_DISTANCE = Math.sqrt(3) * 100

export function rybDistance(a: RYBColor, b: RYBColor): number {
  const dr = a.r - b.r
  const dy = a.y - b.y
  const db = a.b - b.b
  return Math.sqrt(dr * dr + dy * dy + db * db) / MAX_DISTANCE
}

export const TARGET_COLORS: NamedColor[] = [
  { name: 'Naranja',       r: 100, y: 60,  b: 0  },
  { name: 'Verde',         r: 0,   y: 60,  b: 100 },
  { name: 'Violeta',       r: 60,  y: 0,   b: 100 },
  { name: 'Ocre',          r: 50,  y: 80,  b: 0  },
  { name: 'Terracota',     r: 80,  y: 40,  b: 10 },
  { name: 'Oliva',         r: 20,  y: 70,  b: 30 },
  { name: 'Magenta',       r: 100, y: 0,   b: 40 },
  { name: 'Turquesa',      r: 0,   y: 30,  b: 100 },
  { name: 'Siena',         r: 70,  y: 50,  b: 5  },
  { name: 'Coral',         r: 100, y: 30,  b: 10 },
  { name: 'Verde lima',    r: 0,   y: 90,  b: 30 },
  { name: 'Índigo',        r: 20,  y: 0,   b: 100 },
  { name: 'Ámbar',         r: 80,  y: 90,  b: 0  },
  { name: 'Carmín',        r: 100, y: 0,   b: 20 },
  { name: 'Musgo',         r: 10,  y: 50,  b: 40 },
  { name: 'Melocotón',     r: 100, y: 60,  b: 10 },
  { name: 'Azul cobalto',  r: 5,   y: 0,   b: 80 },
  { name: 'Verde bosque',  r: 5,   y: 40,  b: 60 },
  { name: 'Lavanda',       r: 30,  y: 0,   b: 60 },
  { name: 'Dorado',        r: 60,  y: 100, b: 0  },
  { name: 'Bordó',         r: 100, y: 0,   b: 30 },
  { name: 'Cian',          r: 0,   y: 50,  b: 100 },
  { name: 'Salmón',        r: 100, y: 40,  b: 15 },
  { name: 'Verde jade',    r: 0,   y: 45,  b: 70 },
  { name: 'Púrpura',       r: 80,  y: 0,   b: 100 },
  { name: 'Amarillo verdoso', r: 0, y: 100, b: 20 },
  { name: 'Rojo oscuro',   r: 100, y: 10,  b: 5  },
  { name: 'Azul pizarra',  r: 10,  y: 10,  b: 80 },
  { name: 'Naranja tostado', r: 90, y: 45, b: 0  },
  { name: 'Verde cazador', r: 5,   y: 55,  b: 50 },
]
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
bun run test
```

Expected: all 9 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/utils/
git commit -m "feat: add RYB color utility functions with tests"
```

---

## Task 3: Game state machine hook

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.ts`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useColorMixingGame } from './useColorMixingGame'

describe('useColorMixingGame — initial state', () => {
  it('starts in selecting-level phase', () => {
    const { result } = renderHook(() => useColorMixingGame())
    expect(result.current.state.phase).toBe('selecting-level')
    expect(result.current.state.level).toBeNull()
    expect(result.current.state.round).toBe(0)
    expect(result.current.state.score).toBe(0)
  })
})

describe('useColorMixingGame — easy mode', () => {
  it('selectLevel transitions to playing and sets first target', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    expect(result.current.state.phase).toBe('playing')
    expect(result.current.state.level).toBe('easy')
    expect(result.current.state.round).toBe(1)
    expect(result.current.state.targetColor).toBeDefined()
  })

  it('setMix updates mix without changing phase', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    act(() => result.current.actions.setMix(50, 30, 20))
    expect(result.current.state.mix).toEqual({ r: 50, y: 30, b: 20 })
    expect(result.current.state.phase).toBe('playing')
  })

  it('confirmMix transitions to round-end and records lastRoundScore', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    act(() => result.current.actions.confirmMix())
    expect(result.current.state.phase).toBe('round-end')
    expect(result.current.state.lastRoundScore).toBeGreaterThanOrEqual(0)
    expect(result.current.state.lastRoundScore).toBeLessThanOrEqual(10)
  })

  it('nextRound on round 5 transitions to game-over', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    for (let i = 0; i < 5; i++) {
      act(() => result.current.actions.confirmMix())
      if (i < 4) {
        act(() => result.current.actions.nextRound())
      }
    }
    act(() => result.current.actions.nextRound())
    expect(result.current.state.phase).toBe('game-over')
  })

  it('restart returns to selecting-level and resets score', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    act(() => result.current.actions.confirmMix())
    act(() => result.current.actions.restart())
    expect(result.current.state.phase).toBe('selecting-level')
    expect(result.current.state.score).toBe(0)
    expect(result.current.state.round).toBe(0)
    expect(result.current.state.level).toBeNull()
  })
})

describe('useColorMixingGame — hard mode', () => {
  it('game-over immediately when score < 7 on any round', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('hard'))
    // Mix nothing (0,0,0) vs any target = likely low score
    act(() => result.current.actions.confirmMix())
    // If lastRoundScore < 7, should be game-over
    if (result.current.state.lastRoundScore < 7) {
      expect(result.current.state.phase).toBe('game-over')
    } else {
      expect(result.current.state.phase).toBe('round-end')
    }
  })
})

describe('useColorMixingGame — medium mode', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('starts with 60 seconds', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('medium'))
    expect(result.current.state.timeLeft).toBe(60)
  })

  it('timeLeft decrements each second', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('medium'))
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current.state.timeLeft).toBeLessThanOrEqual(57)
  })

  it('transitions to game-over when time reaches 0', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('medium'))
    act(() => vi.advanceTimersByTime(61000))
    expect(result.current.state.phase).toBe('game-over')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
bun run test
```

Expected: `FAIL` — cannot find module `./useColorMixingGame`

- [ ] **Step 3: Implement the hook**

Create `src/pages/dashboard/pages/Games/ColorMixing/hooks/useColorMixingGame.ts`:

```typescript
import { useCallback, useEffect, useReducer, useRef } from 'react'
import { rybDistance, TARGET_COLORS } from '../utils/ryb'
import type { RYBColor, NamedColor } from '../utils/ryb'

export type Level = 'easy' | 'medium' | 'hard'
export type Phase = 'selecting-level' | 'playing' | 'round-end' | 'game-over'

export interface GameState {
  phase: Phase
  level: Level | null
  round: number
  completedRounds: number  // rounds where confirmMix was called; used for ResultScreen
  score: number
  lastRoundScore: number
  timeLeft: number
  targetColor: NamedColor
  mix: RYBColor
  usedIndices: number[]
}

type Action =
  | { type: 'SELECT_LEVEL'; level: Level; target: NamedColor; index: number }
  | { type: 'SET_MIX'; mix: RYBColor }
  | { type: 'CONFIRM_MIX'; roundScore: number; nextPhase: Phase }
  | { type: 'NEXT_ROUND'; target: NamedColor; index: number; nextPhase: Phase }
  | { type: 'TICK' }
  | { type: 'TIMER_EXPIRED' }
  | { type: 'RESTART' }

const EMPTY_TARGET: NamedColor = { name: '', r: 0, y: 0, b: 0 }

const INITIAL_STATE: GameState = {
  phase: 'selecting-level',
  level: null,
  round: 0,
  completedRounds: 0,
  score: 0,
  lastRoundScore: 0,
  timeLeft: 60,
  targetColor: EMPTY_TARGET,
  mix: { r: 0, y: 0, b: 0 },
  usedIndices: [],
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SELECT_LEVEL':
      return {
        ...INITIAL_STATE,
        phase: 'playing',
        level: action.level,
        round: 1,
        timeLeft: 60,
        targetColor: action.target,
        usedIndices: [action.index],
      }

    case 'SET_MIX':
      return { ...state, mix: action.mix }

    case 'CONFIRM_MIX':
      return {
        ...state,
        phase: action.nextPhase,
        score: state.score + action.roundScore,
        lastRoundScore: action.roundScore,
        completedRounds: state.completedRounds + 1,
      }

    case 'NEXT_ROUND':
      // When going to game-over (Easy round 5), keep round as-is; only advance when continuing
      if (action.nextPhase === 'game-over') {
        return { ...state, phase: 'game-over', mix: { r: 0, y: 0, b: 0 }, lastRoundScore: 0 }
      }
      return {
        ...state,
        phase: 'playing',
        round: state.round + 1,
        targetColor: action.target,
        usedIndices: [...state.usedIndices, action.index],
        mix: { r: 0, y: 0, b: 0 },
        lastRoundScore: 0,
      }

    case 'TICK':
      if (state.timeLeft <= 1) return { ...state, timeLeft: 0, phase: 'game-over' }
      return { ...state, timeLeft: state.timeLeft - 1 }

    case 'TIMER_EXPIRED':
      return { ...state, phase: 'game-over', timeLeft: 0 }

    case 'RESTART':
      return { ...INITIAL_STATE }

    default:
      return state
  }
}

function pickTarget(usedIndices: number[]): { target: NamedColor; index: number } {
  const available = TARGET_COLORS
    .map((c, i) => ({ c, i }))
    .filter(({ i }) => !usedIndices.includes(i))
  if (available.length === 0) {
    // all used — reset pool
    const i = Math.floor(Math.random() * TARGET_COLORS.length)
    return { target: TARGET_COLORS[i], index: i }
  }
  const pick = available[Math.floor(Math.random() * available.length)]
  return { target: pick.c, index: pick.i }
}

function calcRoundScore(mix: RYBColor, target: NamedColor): number {
  const dist = rybDistance(mix, target)
  return Math.max(0, parseFloat((10 - dist * 10).toFixed(1)))
}

export function useColorMixingGame() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Medium mode timer
  useEffect(() => {
    if (state.phase === 'playing' && state.level === 'medium') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.phase, state.level])

  const selectLevel = useCallback((level: Level) => {
    const { target, index } = pickTarget([])
    dispatch({ type: 'SELECT_LEVEL', level, target, index })
  }, [])

  const setMix = useCallback((r: number, y: number, b: number) => {
    dispatch({ type: 'SET_MIX', mix: { r, y, b } })
  }, [])

  const confirmMix = useCallback(() => {
    const roundScore = calcRoundScore(state.mix, state.targetColor)
    let nextPhase: Phase = 'round-end'
    if (state.level === 'hard' && roundScore < 7) {
      nextPhase = 'game-over'
    }
    dispatch({ type: 'CONFIRM_MIX', roundScore, nextPhase })
  }, [state.mix, state.targetColor, state.level])

  const nextRound = useCallback(() => {
    const { target, index } = pickTarget(state.usedIndices)
    let nextPhase: Phase = 'playing'
    if (state.level === 'easy' && state.round >= 5) {
      nextPhase = 'game-over'
    }
    dispatch({ type: 'NEXT_ROUND', target, index, nextPhase })
  }, [state.usedIndices, state.level, state.round])

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' })
  }, [])

  return {
    state,
    actions: { selectLevel, setMix, confirmMix, nextRound, restart },
  }
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
bun run test
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/hooks/
git commit -m "feat: add useColorMixingGame state machine hook with tests"
```

---

## Task 4: GamesHub landing page

**Files:**
- Create: `src/pages/dashboard/pages/Games/GamesHub/GamesHub.tsx`
- Create: `src/pages/dashboard/pages/Games/GamesHub/GamesHub.module.css`

- [ ] **Step 1: Create `GamesHub.tsx`**

```tsx
import { useNavigate } from 'react-router-dom'
import styles from './GamesHub.module.css'

interface GameCard {
  id: string
  title: string
  description: string
  tags: string[]
  path: string
  available: boolean
}

const GAMES: GameCard[] = [
  {
    id: 'color-mixing',
    title: 'Mezcla de colores',
    description: 'Mezcla Rojo, Amarillo y Azul para igualar el color objetivo. Tres niveles de dificultad.',
    tags: ['Color', 'RYB', 'Pintura'],
    path: '/dashboard/games/color-mixing',
    available: true,
  },
  {
    id: 'color-sort',
    title: 'Ordenar tonos',
    description: 'Arrastra los colores para ordenarlos por saturación, luminosidad o temperatura. Próximamente.',
    tags: ['Color', 'Percepción'],
    path: '/dashboard/games/color-sort',
    available: false,
  },
]

export default function GamesHub() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Práctica</h1>
        <p className={styles.subtitle}>Ejercicios para desarrollar tu ojo artístico</p>
      </header>

      <div className={styles.grid}>
        {GAMES.map((game) => (
          <button
            key={game.id}
            className={`${styles.card} ${!game.available ? styles.cardDisabled : ''}`}
            onClick={() => game.available && navigate(game.path)}
            disabled={!game.available}
          >
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>{game.title}</h2>
              <p className={styles.cardDesc}>{game.description}</p>
            </div>
            <div className={styles.tags}>
              {game.tags.map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
              {!game.available && <span className={styles.tagSoon}>Próximamente</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `GamesHub.module.css`**

```css
.container {
  padding: 2rem;
  max-width: 900px;
}

.header {
  margin-bottom: 2rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #666;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card:hover:not(:disabled) {
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.cardDisabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cardBody {
  flex: 1;
}

.cardTitle {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.cardDesc {
  font-size: 0.875rem;
  color: #555;
  margin: 0;
  line-height: 1.5;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.tagSoon {
  background: #fef3c7;
  color: #92400e;
  font-size: 0.75rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/GamesHub/
git commit -m "feat: add GamesHub landing page"
```

---

## Task 5: LevelSelector component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.module.css`

- [ ] **Step 1: Create `LevelSelector.tsx`**

```tsx
import type { Level } from '../hooks/useColorMixingGame'
import styles from './LevelSelector.module.css'

interface Props {
  onSelect: (level: Level) => void
}

const LEVELS: { id: Level; label: string; description: string; rule: string }[] = [
  {
    id: 'easy',
    label: 'Fácil',
    description: '5 rondas fijas',
    rule: 'Consigue el mayor puntaje acumulado en 5 colores.',
  },
  {
    id: 'medium',
    label: 'Medio',
    description: '60 segundos',
    rule: 'Mezcla tantos colores como puedas antes de que se acabe el tiempo.',
  },
  {
    id: 'hard',
    label: 'Difícil',
    description: 'Sobrevive',
    rule: 'Necesitas 7.0 o más en cada ronda. Un error y termina el juego.',
  },
]

export default function LevelSelector({ onSelect }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Elige tu nivel</h2>
      <div className={styles.grid}>
        {LEVELS.map((level) => (
          <button
            key={level.id}
            className={styles.card}
            onClick={() => onSelect(level.id)}
          >
            <span className={styles.label}>{level.label}</span>
            <span className={styles.description}>{level.description}</span>
            <p className={styles.rule}>{level.rule}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `LevelSelector.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.grid {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  width: 200px;
  cursor: pointer;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 16px rgba(99,102,241,0.15);
}

.label {
  font-size: 1.25rem;
  font-weight: 700;
}

.description {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.rule {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.tsx src/pages/dashboard/pages/Games/ColorMixing/components/LevelSelector.module.css
git commit -m "feat: add LevelSelector component"
```

---

## Task 6: TargetColor component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.module.css`

- [ ] **Step 1: Create `TargetColor.tsx`**

```tsx
import { rybToHex } from '../utils/ryb'
import type { NamedColor } from '../utils/ryb'
import styles from './TargetColor.module.css'

interface Props {
  color: NamedColor
}

export default function TargetColor({ color }: Props) {
  const hex = rybToHex(color.r, color.y, color.b)
  return (
    <div className={styles.container}>
      <p className={styles.label}>Color objetivo</p>
      <div className={styles.swatch} style={{ backgroundColor: hex }} />
      <p className={styles.name}>{color.name}</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `TargetColor.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
  margin: 0;
}

.swatch {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.tsx src/pages/dashboard/pages/Games/ColorMixing/components/TargetColor.module.css
git commit -m "feat: add TargetColor component"
```

---

## Task 7: ColorMixer component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.module.css`

- [ ] **Step 1: Create `ColorMixer.tsx`**

```tsx
import { rybToHex } from '../utils/ryb'
import type { RYBColor } from '../utils/ryb'
import styles from './ColorMixer.module.css'

interface Props {
  mix: RYBColor
  onChange: (r: number, y: number, b: number) => void
  onConfirm: () => void
}

const SLIDERS = [
  { key: 'r' as const, label: 'Rojo', color: '#ef4444' },
  { key: 'y' as const, label: 'Amarillo', color: '#eab308' },
  { key: 'b' as const, label: 'Azul', color: '#3b82f6' },
]

export default function ColorMixer({ mix, onChange, onConfirm }: Props) {
  const previewHex = rybToHex(mix.r, mix.y, mix.b)

  const handleChange = (channel: keyof RYBColor, value: number) => {
    onChange(
      channel === 'r' ? value : mix.r,
      channel === 'y' ? value : mix.y,
      channel === 'b' ? value : mix.b,
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.preview} style={{ backgroundColor: previewHex }} />
      <p className={styles.previewLabel}>Tu mezcla</p>

      <div className={styles.sliders}>
        {SLIDERS.map(({ key, label, color }) => (
          <div key={key} className={styles.sliderRow}>
            <label className={styles.sliderLabel} style={{ color }}>
              {label} <span className={styles.value}>{mix[key]}</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={mix[key]}
              onChange={(e) => handleChange(key, Number(e.target.value))}
              className={styles.slider}
              style={{ accentColor: color }}
            />
          </div>
        ))}
      </div>

      <button className={styles.confirmBtn} onClick={onConfirm}>
        Confirmar mezcla
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Create `ColorMixer.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 340px;
}

.preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.1);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.previewLabel {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.sliders {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sliderRow {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sliderLabel {
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}

.value {
  font-weight: 400;
  color: #374151;
}

.slider {
  width: 100%;
  cursor: pointer;
}

.confirmBtn {
  margin-top: 0.5rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.confirmBtn:hover {
  background: #4f46e5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.tsx src/pages/dashboard/pages/Games/ColorMixing/components/ColorMixer.module.css
git commit -m "feat: add ColorMixer component with RYB sliders"
```

---

## Task 8: ScoreDisplay component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.module.css`

- [ ] **Step 1: Create `ScoreDisplay.tsx`**

```tsx
import type { Level } from '../hooks/useColorMixingGame'
import styles from './ScoreDisplay.module.css'

interface Props {
  round: number
  score: number
  level: Level
  timeLeft: number
}

export default function ScoreDisplay({ round, score, level, timeLeft }: Props) {
  return (
    <div className={styles.bar}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Ronda</span>
        <span className={styles.statValue}>
          {level === 'easy' ? `${round}/5` : round}
        </span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>Puntaje</span>
        <span className={styles.statValue}>{score.toFixed(1)}</span>
      </div>
      {level === 'hard' && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>Mínimo</span>
          <span className={`${styles.statValue} ${styles.danger}`}>7.0</span>
        </div>
      )}
      {level === 'medium' && (
        <div className={styles.stat}>
          <span className={styles.statLabel}>Tiempo</span>
          <span className={`${styles.statValue} ${timeLeft <= 10 ? styles.danger : ''}`}>
            {timeLeft}s
          </span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create `ScoreDisplay.module.css`**

```css
.bar {
  display: flex;
  gap: 2rem;
  padding: 0.75rem 1.5rem;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.statLabel {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9ca3af;
}

.statValue {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.danger {
  color: #ef4444;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.tsx src/pages/dashboard/pages/Games/ColorMixing/components/ScoreDisplay.module.css
git commit -m "feat: add ScoreDisplay component"
```

---

## Task 9: RoundTimer component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.module.css`

- [ ] **Step 1: Create `RoundTimer.tsx`**

```tsx
import styles from './RoundTimer.module.css'

interface Props {
  timeLeft: number
  total?: number
}

export default function RoundTimer({ timeLeft, total = 60 }: Props) {
  const pct = (timeLeft / total) * 100
  const color = pct > 40 ? '#22c55e' : pct > 15 ? '#f59e0b' : '#ef4444'

  return (
    <div className={styles.container}>
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className={styles.label} style={{ color }}>{timeLeft}s</span>
    </div>
  )
}
```

- [ ] **Step 2: Create `RoundTimer.module.css`**

```css
.container {
  width: 100%;
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.track {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.9s linear, background 0.3s;
}

.label {
  font-size: 0.875rem;
  font-weight: 700;
  min-width: 32px;
  text-align: right;
  transition: color 0.3s;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.tsx src/pages/dashboard/pages/Games/ColorMixing/components/RoundTimer.module.css
git commit -m "feat: add RoundTimer component for Medium mode"
```

---

## Task 10: ResultScreen component

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.module.css`

- [ ] **Step 1: Create `ResultScreen.tsx`**

```tsx
import type { Level } from '../hooks/useColorMixingGame'
import styles from './ResultScreen.module.css'

interface Props {
  score: number
  rounds: number
  level: Level
  onRestart: () => void
}

function performanceLabel(score: number, rounds: number, level: Level): string {
  if (level === 'easy') {
    const avg = rounds > 0 ? score / rounds : 0
    if (avg >= 8) return 'Excelente ojo artístico'
    if (avg >= 6) return 'Buen trabajo'
    return 'Sigue practicando'
  }
  if (level === 'medium') {
    if (rounds >= 10) return 'Velocidad impresionante'
    if (rounds >= 5) return 'Buen ritmo'
    return 'Sigue entrenando'
  }
  // hard
  if (rounds >= 10) return 'Maestro del color'
  if (rounds >= 5) return 'Buen control'
  return 'Sigue practicando'
}

export default function ResultScreen({ score, rounds, level, onRestart }: Props) {
  const label = performanceLabel(score, rounds, level)

  return (
    <div className={styles.container}>
      <h2 className={styles.label}>{label}</h2>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{score.toFixed(1)}</span>
          <span className={styles.statDesc}>puntaje total</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>{rounds}</span>
          <span className={styles.statDesc}>rondas completadas</span>
        </div>
        {rounds > 0 && (
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {(score / rounds).toFixed(1)}
            </span>
            <span className={styles.statDesc}>promedio por ronda</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.restartBtn} onClick={onRestart}>
          Jugar de nuevo
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `ResultScreen.module.css`**

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  text-align: center;
}

.label {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.stats {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.statNum {
  font-size: 2.5rem;
  font-weight: 800;
  color: #6366f1;
  line-height: 1;
}

.statDesc {
  font-size: 0.8rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.actions {
  display: flex;
  gap: 1rem;
}

.restartBtn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.restartBtn:hover {
  background: #4f46e5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.tsx src/pages/dashboard/pages/Games/ColorMixing/components/ResultScreen.module.css
git commit -m "feat: add ResultScreen component"
```

---

## Task 11: ColorMixingGame page (assembly)

**Files:**
- Create: `src/pages/dashboard/pages/Games/ColorMixing/ColorMixingGame.tsx`
- Create: `src/pages/dashboard/pages/Games/ColorMixing/ColorMixingGame.module.css`

- [ ] **Step 1: Create `ColorMixingGame.tsx`**

```tsx
import { useColorMixingGame } from './hooks/useColorMixingGame'
import LevelSelector from './components/LevelSelector'
import TargetColor from './components/TargetColor'
import ColorMixer from './components/ColorMixer'
import ScoreDisplay from './components/ScoreDisplay'
import RoundTimer from './components/RoundTimer'
import ResultScreen from './components/ResultScreen'
import styles from './ColorMixingGame.module.css'

export default function ColorMixingGame() {
  const { state, actions } = useColorMixingGame()
  const { phase, level, round, completedRounds, score, lastRoundScore, timeLeft, targetColor, mix } = state

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mezcla de colores</h1>
        {phase !== 'selecting-level' && level && (
          <ScoreDisplay round={round} score={score} level={level} timeLeft={timeLeft} />
        )}
      </header>

      <div className={styles.content}>
        {phase === 'selecting-level' && (
          <LevelSelector onSelect={actions.selectLevel} />
        )}

        {phase === 'playing' && level && (
          <>
            {level === 'medium' && (
              <RoundTimer timeLeft={timeLeft} total={60} />
            )}
            <div className={styles.gameArea}>
              <TargetColor color={targetColor} />
              <ColorMixer
                mix={mix}
                onChange={actions.setMix}
                onConfirm={actions.confirmMix}
              />
            </div>
          </>
        )}

        {phase === 'round-end' && (
          <div className={styles.roundEnd}>
            <p className={styles.roundScore}>
              Puntaje esta ronda: <strong>{lastRoundScore.toFixed(1)}</strong>
            </p>
            <button className={styles.nextBtn} onClick={actions.nextRound}>
              {level === 'easy' && round >= 5 ? 'Ver resultados' : 'Siguiente ronda'}
            </button>
          </div>
        )}

        {phase === 'game-over' && level && (
          <ResultScreen
            score={score}
            rounds={completedRounds}
            level={level}
            onRestart={actions.restart}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `ColorMixingGame.module.css`**

```css
.page {
  padding: 2rem;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.gameArea {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  flex-wrap: wrap;
  justify-content: center;
}

.roundEnd {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  text-align: center;
}

.roundScore {
  font-size: 1.25rem;
  margin: 0;
}

.nextBtn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.625rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.nextBtn:hover {
  background: #4f46e5;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/pages/Games/ColorMixing/
git commit -m "feat: add ColorMixingGame page assembling all game components"
```

---

## Task 12: Games module entry + routing

**Files:**
- Create: `src/pages/dashboard/pages/Games/routes.tsx`
- Create: `src/pages/dashboard/pages/Games/index.tsx`
- Modify: `src/pages/dashboard/routes.tsx`

- [ ] **Step 1: Create `Games/routes.tsx`**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import GamesHub from './GamesHub/GamesHub'
import ColorMixingGame from './ColorMixing/ColorMixingGame'

export default function GamesRoutes() {
  return (
    <Routes>
      <Route index element={<GamesHub />} />
      <Route path="color-mixing" element={<ColorMixingGame />} />
      <Route path="*" element={<Navigate to="/dashboard/games" replace />} />
    </Routes>
  )
}
```

- [ ] **Step 2: Create `Games/index.tsx`**

```tsx
import GamesRoutes from './routes'

export default function GamesModule() {
  return <GamesRoutes />
}
```

- [ ] **Step 3: Register in `src/pages/dashboard/routes.tsx`**

Add the import and route. The new file should look like:

```tsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home/Home";
import UploadGalleryPage from "./pages/UploadPicture/UploadPictures";
import UpdatePicture from "./pages/UpdatePicture/UpdatePicture";
import ReviewArtWorksPage from "./pages/ReviewArtWorks/ReviewArtWorks";
import YourGalleryReviewPage from "./pages/YourGalleryReview/YourGalleryReview";
import CreateEventPage from "./pages/CreateEvent/CreateEvent";
import ReviewEvents from "./pages/ReviewEvents/ReviewEvents";
import EditEventPage from "./pages/EditEvent/EditEvent";
import Calendar from "./pages/Calendar/Calendar";
import InvitationsPage from "./pages/Invitations/Invitations";
import MyEventsPage from "./pages/MyEvents/MyEvents";
import ClasesPage from "./pages/Clases/Clases";
import GamesModule from "./pages/Games";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/dashboard/home" replace />} />

      <Route path="/home" element={<HomePage />} />
      <Route path="/upload" element={<UploadGalleryPage />} />
      <Route path="/update/:uid" element={<UpdatePicture />} />
      <Route path="/review-art" element={<ReviewArtWorksPage />} />
      <Route path="/your-gallery" element={<YourGalleryReviewPage />} />
      <Route path="/create-event" element={<CreateEventPage />} />
      <Route path="/events/" element={<ReviewEvents />} />
      <Route path="/events/edit/:uid" element={<EditEventPage />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/invitations" element={<InvitationsPage />} />
      <Route path="/my-events" element={<MyEventsPage />} />
      <Route path="/clases" element={<ClasesPage />} />
      <Route path="/games/*" element={<GamesModule />} />

      {/* futuras rutas */}
      {/* <Route path="users" element={<UsersPage />} /> */}
    </Routes>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/dashboard/pages/Games/routes.tsx src/pages/dashboard/pages/Games/index.tsx src/pages/dashboard/routes.tsx
git commit -m "feat: register Games module routes in dashboard"
```

---

## Task 13: Add "Práctica" item to Sidebar

**Files:**
- Modify: `src/pages/dashboard/components/Siderbar/Sidebar.tsx`

- [ ] **Step 1: Add the Práctica nav item**

In `Sidebar.tsx`, after the "Calendario" `<li>` block (around line 117) and before the professor-only block, insert:

```tsx
<li>
  <button
    className={styles.listItem}
    onClick={() => handleNavigation("/dashboard/games")}
  >
    <svg
      className={styles.icon}
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8M12 8v8" />
    </svg>
    <span>Práctica</span>
  </button>
</li>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd UstaGallery && bun run build
```

Expected: build completes without errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/components/Siderbar/Sidebar.tsx
git commit -m "feat: add Práctica nav item to sidebar linking to /dashboard/games"
```

---

## Task 14: Final verification

- [ ] **Step 1: Run all tests**

```bash
bun run test
```

Expected: all unit tests pass

- [ ] **Step 2: Start the dev server**

```bash
bun run dev
```

- [ ] **Step 3: Manual smoke test checklist**

Navigate to `http://localhost:5173` and log in as a student.

| Check | Expected |
|-------|----------|
| Sidebar shows "Práctica" | Visible for all roles |
| Click "Práctica" → `/dashboard/games` | GamesHub renders with Color Mixing card |
| Click "Mezcla de colores" | ColorMixingGame loads with LevelSelector |
| Select "Fácil" | Round 1/5 starts, target color shown |
| Move sliders | Live preview swatch updates |
| Click "Confirmar mezcla" | Round-end screen shows score |
| Click "Siguiente ronda" | Round 2/5 starts with new target |
| Complete 5 rounds | ResultScreen shows final score and average |
| Click "Jugar de nuevo" | LevelSelector reappears |
| Select "Medio" | Timer starts counting down |
| Let timer expire | Game over, ResultScreen shows rounds completed |
| Select "Difícil" | Starts normally; if score < 7, game ends immediately |
| "Color sort" card | Shows "Próximamente", is not clickable |

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -p
git commit -m "fix: smoke test corrections for games module"
```
