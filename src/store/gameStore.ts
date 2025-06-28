import { create } from 'zustand'

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function distance(a: [number, number], b: [number, number]) {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

function generateIslands({
  count,
  seed,
  spread,
  buffer,
  maxTries,
}: {
  count: number
  seed: number
  spread: number
  buffer: number
  maxTries: number
}) {
  const rand = mulberry32(seed)
  const positions: [number, number][] = []
  for (let i = 0; i < count; i++) {
    let tries = 0
    let ix = 0,
      iy = 0
    let ok = false
    while (tries < maxTries && !ok) {
      ix = (rand() - 0.5) * spread
      iy = (rand() - 0.5) * spread
      ok = positions.every(([px, py]) => distance([ix, iy], [px, py]) >= buffer)
      tries++
    }
    if (ok) {
      positions.push([ix, iy])
    }
  }
  return positions
}

export interface GameState {
  boatState: { x: number; y: number; angle: number }
  count: number
  seed: number
  spread: number
  buffer: number
  maxTries: number
  drawDistance: number
  showDockingPoints: boolean
  positions: [number, number][]
}

export const useGameStore = create<GameState>(() => {
  const count = 50
  const seed = 12345
  const spread = 2000
  const buffer = 240
  const maxTries = 1000
  const drawDistance = 500

  return {
    boatState: { x: 0, y: 0, angle: Math.PI * 0.5 },
    count,
    seed,
    spread,
    buffer,
    maxTries,
    drawDistance,
    showDockingPoints: true,
    positions: generateIslands({ count, seed, spread, buffer, maxTries }),
  }
})
