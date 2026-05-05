import { describe, it, expect } from 'vitest'
import { rybToHex, rybDistance, TARGET_COLORS } from './ryb'

describe('rybToHex', () => {
  it('pure red returns red-ish hex', () => {
    const hex = rybToHex(100, 0, 0)
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
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
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    expect(b).toBeGreaterThan(r)
    expect(b).toBeGreaterThan(g)
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
  it('has at least 30 colors', () => {
    expect(TARGET_COLORS.length).toBeGreaterThanOrEqual(30)
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
