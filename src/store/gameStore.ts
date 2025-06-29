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
        offsetX: overrides[i]?.offsetX ?? 0,
        offsetY: overrides[i]?.offsetY ?? 0,
        offsetZ: overrides[i]?.offsetZ ?? 0,
        seed: 0,
        elevation: 1,
        size: 1.3,
        noise: 9,
        curve: 1.1,
        lighthousePosition: overrides[i]?.lighthouse.position ?? { x: 0, y: 0 },
        lighthouseRotation:
          overrides[i]?.lighthouse.rotation?.y !== undefined
            ? { y: overrides[i].lighthouse.rotation.y }
            : { y: 0 },
        dockingPoint: overrides[i]?.dockingPoint ?? { dx: 0, dy: 0 },
        neighbours: [], // will be filled in next step
        beziers: {}, // will be filled in next step
      })
    }
  }
  // Compute neighbours for each island
  islands.forEach((island, idx) => {
    const dists = islands
      .map((other, j) => ({
        idx: j,
        dist:
          idx === j
            ? Infinity
            : distance([island.x, island.y], [other.x, other.y]),
      }))
      .sort((a, b) => a.dist - b.dist)
    island.neighbours = dists.filter((d) => d.dist < 200).map((d) => d.idx)
  })
  // Precompute cubic bezier curves for all neighbours
  islands.forEach((island) => {
    island.beziers = {}
    island.neighbours.forEach((j) => {
      const other = islands[j]
      const start: [number, number] = [
        island.x + island.dockingPoint.dx,
        island.y + island.dockingPoint.dy,
      ]
      const end: [number, number] = [
        other.x + other.dockingPoint.dx,
        other.y + other.dockingPoint.dy,
      ]
      // Handles: control1 near start, control2 near end
      const dx = end[0] - start[0]
      const dy = end[1] - start[1]
      const len = Math.sqrt(dx * dx + dy * dy)
      // Perpendicular for curve
      const perp = [-(dy / len), dx / len]
      // Control points offset from start/end
      const handleLen = len * 0.25
      const control: [number, number] = [
        start[0] + dx * 0.5 + perp[0] * handleLen * 0.5,
        start[1] + dy * 0.5 + perp[1] * handleLen * 0.5,
      ]

      island.beziers[j] = { start, control, end }
    })
  })
  return islands
}

export interface IslandData {
  x: number
  y: number
  offsetX: number
  offsetY: number
  offsetZ: number
  seed: number
  elevation: number
  size: number
  noise: number
  curve: number
  dockingPoint: { dx: number; dy: number }
  lighthousePosition: { x: number; y: number }
  lighthouseRotation: { y: number }
  neighbours: number[]
  beziers: {
    [neighbourIdx: number]: {
      start: [number, number]
      control: [number, number]
      end: [number, number]
    }
  }
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
  bezierPath: {
    start: [number, number]
    control: [number, number]
    end: [number, number]
  } | null
  moveBoatToDock: (index: number) => void
  setBoatState: (state: { x: number; y: number; angle: number }) => void
  lighthouseEditMode: 'translate' | 'rotate'
  setLighthouseEditMode: (mode: 'translate' | 'rotate') => void
  saveLighthousePositions: () => void
  showDestinationModal: boolean
  setShowDestinationModal: (show: boolean) => void
}

export const useGameStore = create<GameState>((set, get) => {
  const count = 50
  const seed = 12345
  const spread = 900
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
    count,
    seed,
    spread,
    buffer,
    maxTries,
    drawDistance,
    showDockingPoints: true,
    islands,
    currentDockingIndex: 0,
    bezierPath: null,
    lighthouseEditMode: 'translate' as 'translate' | 'rotate',
    showDestinationModal: true,
    moveBoatToDock: (index: number) => {
      const islands = get().islands
      const currentIdx = get().currentDockingIndex
      const currentIsland = islands[currentIdx]
      const bezier = currentIsland.beziers[index]
      if (!bezier) return
      set({
        bezierPath: bezier,
        currentDockingIndex: index,
      })
    },
    setBoatState: (state) => set({ boatState: state }),
    setLighthouseEditMode: (mode) => set({ lighthouseEditMode: mode }),
    setShowDestinationModal: (show) => set({ showDestinationModal: show }),
    saveLighthousePositions: () => {
      const positions = get().islands.map((island) => ({
        offsetX: island.offsetX,
        offsetY: island.offsetY,
        offsetZ: island.offsetZ,
        lighthouse: {
          position: island.lighthousePosition,
          rotation: { y: island.lighthouseRotation?.y ?? 0 },
        },
        dockingPoint: island.dockingPoint,
      }))
      console.log('Saving overrides:', positions)
      navigator.clipboard.writeText(JSON.stringify(positions, null, 2))
    },
  }
})
