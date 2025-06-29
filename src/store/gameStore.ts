import { create } from 'zustand'
import overrides from '../overrides.json'

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
        lighthousePosition: overrides[i]?.lighthouse.position ?? { x: 0, y: 0 },
        lighthouseRotation:
          overrides[i]?.lighthouse.rotation?.y !== undefined
            ? { y: overrides[i].lighthouse.rotation.y }
            : { y: 0 },
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
  lighthousePosition: { x: number; y: number }
  lighthouseRotation: { y: number }
}

export interface GameState {
  boatState: { x: number; y: number; angle: number }
  boatTarget: { x: number; y: number; angle: number }
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
  setBoatState: (state: { x: number; y: number; angle: number }) => void
  lighthouseEditMode: 'translate' | 'rotate'
  setLighthouseEditMode: (mode: 'translate' | 'rotate') => void
  saveLighthousePositions: () => void
}

export const useGameStore = create<GameState>((set, get) => {
  const count = 50
  const seed = 12345
  const spread = 200
  const buffer = 40
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
    boatTarget: initialBoat,
    count,
    seed,
    spread,
    buffer,
    maxTries,
    drawDistance,
    showDockingPoints: true,
    islands,
    currentDockingIndex: 0,
    lighthouseEditMode: 'translate',
    moveBoatToDock: (index: number) => {
      const island = get().islands[index]
      if (!island) return
      const { boatState } = get()
      const targetX = island.x + island.dockingPoint.dx
      const targetY = island.y + island.dockingPoint.dy
      // Calculate angle to face direction of travel
      const dx = targetX - boatState.x
      const dy = targetY - boatState.y
      const angle = Math.atan2(dx, dy)
      set({
        boatTarget: {
          x: targetX,
          y: targetY,
          angle,
        },
        currentDockingIndex: index,
      })
    },
    moveBoatToNextDock: () => {
      const { currentDockingIndex, islands } = get()
      const current = islands[currentDockingIndex]
      if (!current) return
      // Find the closest dock that is not the current one
      let minDist = Infinity
      let minIdx = currentDockingIndex
      for (let i = 0; i < islands.length; i++) {
        if (i === currentDockingIndex) continue
        const d = distance(
          [
            current.x + current.dockingPoint.dx,
            current.y + current.dockingPoint.dy,
          ],
          [
            islands[i].x + islands[i].dockingPoint.dx,
            islands[i].y + islands[i].dockingPoint.dy,
          ],
        )
        if (d < minDist) {
          minDist = d
          minIdx = i
        }
      }
      get().moveBoatToDock(minIdx)
    },
    moveBoatToPrevDock: () => {
      const { currentDockingIndex, islands } = get()
      const current = islands[currentDockingIndex]
      if (!current) return
      // Find the second closest dock (for prev, just as an example)
      // Get all distances
      const distances = islands.map((island, i) => ({
        i,
        d:
          i === currentDockingIndex
            ? Infinity
            : distance(
                [
                  current.x + current.dockingPoint.dx,
                  current.y + current.dockingPoint.dy,
                ],
                [
                  island.x + island.dockingPoint.dx,
                  island.y + island.dockingPoint.dy,
                ],
              ),
      }))
      // Sort by distance
      distances.sort((a, b) => a.d - b.d)
      // Pick the second closest (if exists), else fallback to closest
      const prevIdx = distances[1]?.i ?? distances[0].i
      get().moveBoatToDock(prevIdx)
    },
    setBoatState: (state) => set({ boatState: state }),
    setLighthouseEditMode: (mode) => set({ lighthouseEditMode: mode }),
    saveLighthousePositions: () => {
      const positions = get().islands.map((island) => ({
        lighthouse: {
          position: island.lighthousePosition,
          rotation: { y: island.lighthouseRotation?.y ?? 0 },
        },
      }))
      console.log('Saving overrides:', positions)
      navigator.clipboard.writeText(JSON.stringify(positions, null, 2))
    },
  }
})
