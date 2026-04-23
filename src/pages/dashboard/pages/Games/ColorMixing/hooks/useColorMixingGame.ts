import { useCallback, useEffect, useReducer, useRef } from 'react'
import { rybDistance, TARGET_COLORS } from '../utils/ryb'
import type { RYBColor, NamedColor } from '../utils/ryb'

export type Level = 'easy' | 'medium' | 'hard'
export type Phase = 'selecting-level' | 'playing' | 'round-end' | 'game-over'

export interface GameState {
  phase: Phase
  level: Level | null
  round: number
  completedRounds: number  // incremented only on confirmMix; used by ResultScreen
  score: number
  lastRoundScore: number
  timeLeft: number         // seconds; only relevant in medium mode
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
      // Easy mode after round 5: go to game-over without incrementing round counter
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

  // Medium mode: tick every second while playing
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
