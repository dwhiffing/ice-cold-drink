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
  const islands: IslandData[] = []
  for (let i = 0; i < count; i++) {
    let tries = 0
    let ix = 0,
      iy = 0
    let ok = false
    while (tries < maxTries && !ok) {
      ix = (rand() - 0.5) * spread
      iy = (rand() - 0.5) * spread
      ok = islands.every(({ x, y }) => distance([ix, iy], [x, y]) >= buffer)
      tries++
    }
    if (ok) {
      islands.push({
        x: ix,
        y: iy,
        seed: 0,
        // seed: i,
        elevation: 1,
        size: 1.3,
        noise: 9,
        curve: 1.1,
        dockingPoint: { dx: -3, dy: 0 },
      })
    }
  }
  return islands
}

export interface IslandData {
  x: number
  y: number
  seed: number
  elevation: number
  size: number
  noise: number
  curve: number
  dockingPoint: { dx: number; dy: number }
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
  islands: IslandData[]
  currentDockingIndex: number
  moveBoatToDock: (index: number) => void
  moveBoatToNextDock: () => void
  moveBoatToPrevDock: () => void
}

export const useGameStore = create<GameState>((set, get) => {
  const count = 50
  const seed = 12345
  const spread = 2000
  const buffer = 240
  const maxTries = 1000
  const drawDistance = 500
  const islands = generateIslands({ count, seed, spread, buffer, maxTries })
  // Boat starts at first docking point
  const initialBoat = {
    x: islands[0].x + islands[0].dockingPoint.dx,
    y: islands[0].y + islands[0].dockingPoint.dy,
    angle: Math.PI * 0.5,
  }

  return {
    boatState: initialBoat,
    count,
    seed,
    spread,
    buffer,
    maxTries,
    drawDistance,
    showDockingPoints: true,
    islands,
    currentDockingIndex: 0,
    moveBoatToDock: (index: number) => {
      const island = get().islands[index]
      if (!island) return
      set({
        boatState: {
          x: island.x + island.dockingPoint.dx,
          y: island.y + island.dockingPoint.dy,
          angle: Math.PI * 0.5,
        },
        currentDockingIndex: index,
      })
    },
    moveBoatToNextDock: () => {
      const { currentDockingIndex, islands } = get()
      const next = (currentDockingIndex + 1) % islands.length
      get().moveBoatToDock(next)
    },
    moveBoatToPrevDock: () => {
      const { currentDockingIndex, islands } = get()
      const prev = (currentDockingIndex - 1 + islands.length) % islands.length
      get().moveBoatToDock(prev)
    },
  }
})
