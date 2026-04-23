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

  it('confirmMix increments completedRounds', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    act(() => result.current.actions.confirmMix())
    expect(result.current.state.completedRounds).toBe(1)
  })

  it('nextRound on round 5 transitions to game-over without incrementing round', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    for (let i = 0; i < 5; i++) {
      act(() => result.current.actions.confirmMix())
      act(() => result.current.actions.nextRound())
    }
    expect(result.current.state.phase).toBe('game-over')
    expect(result.current.state.round).toBe(5) // does NOT increment beyond 5
    expect(result.current.state.completedRounds).toBe(5)
  })

  it('restart returns to selecting-level and resets all state', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('easy'))
    act(() => result.current.actions.confirmMix())
    act(() => result.current.actions.restart())
    expect(result.current.state.phase).toBe('selecting-level')
    expect(result.current.state.score).toBe(0)
    expect(result.current.state.round).toBe(0)
    expect(result.current.state.completedRounds).toBe(0)
    expect(result.current.state.level).toBeNull()
  })
})

describe('useColorMixingGame — hard mode', () => {
  it('game-over immediately when score < 7 on first round (mix nothing vs any target)', () => {
    const { result } = renderHook(() => useColorMixingGame())
    act(() => result.current.actions.selectLevel('hard'))
    act(() => result.current.actions.confirmMix()) // mix is (0,0,0), target is some color
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
