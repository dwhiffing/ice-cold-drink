import { create } from 'zustand'
import overrides from '../overrides.json'
import {
  DEBUG,
  ENCOUNTERS,
  FUEL_UNIT_DISTANCE,
  ISLAND_NAMES,
  NEIGHBOUR_DISTANCE,
  STARTING_FUEL,
  STARTING_ISLAND,
  STARTING_MONEY,
} from '../utils/constants'

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
  const rand2 = mulberry32(seed)
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
      // Assign prices for all resources
      const prices: { [key: string]: number; fuel: number } = {
        fuel: Math.floor(rand() * 16) + 5,
      }
      COMMODITIES.forEach((c) => {
        // Each island gets a price for each commodity, randomizing around its base value
        const variance = c.baseValue * 0.2
        prices[c.name] = Math.max(
          1,
          Math.round(c.baseValue + (rand2() - 0.5) * variance * 2),
        )
      })
      islands.push({
        x: ix,
        y: iy,
        name: ISLAND_NAMES[i] ?? `Island ${i + 1}`,
        offsetX: overrides[i]?.offsetX ?? 0,
        offsetY: overrides[i]?.offsetY ?? 0,
        offsetZ: overrides[i]?.offsetZ ?? 0,
        seed: 0,
        elevation: 1,
        size: 1.3,
        noise: 9,
        curve: 1.1,
        index: i,
        lighthousePosition: overrides[i]?.lighthouse.position ?? { x: 0, y: 0 },
        lighthouseRotation:
          overrides[i]?.lighthouse.rotation?.y !== undefined
            ? { y: overrides[i].lighthouse.rotation.y }
            : { y: 0 },
        dockingPoint: overrides[i]?.dockingPoint ?? { dx: 0, dy: 0 },
        neighbours: [], // will be filled in next step
        beziers: {}, // will be filled in next step
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bezierOverrides: (overrides[i]?.bezierOverrides as any) ?? {},
        prices,
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
            : distance(
                [island.x + island.offsetX, island.y + island.offsetZ],
                [other.x + other.offsetX, other.y + other.offsetZ],
              ),
      }))
      .sort((a, b) => a.dist - b.dist)
    island.neighbours = dists
      .filter((d) => d.dist < NEIGHBOUR_DISTANCE)
      .map((d) => d.idx)
  })
  // Precompute cubic bezier curves for all neighbours
  islands.forEach((island, i) => {
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
      let control1, control2
      // Load bezier handles from overrides if present
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bezierOverrides = overrides[i]?.bezierOverrides as any
      if (bezierOverrides && bezierOverrides[j]) {
        control1 = bezierOverrides[j].control1
        control2 = bezierOverrides[j].control2
      } else {
        const dx = end[0] - start[0]
        const dy = end[1] - start[1]
        const len = Math.sqrt(dx * dx + dy * dy)
        const perp = [-(dy / len), dx / len]
        const handleLen = len * 0.25
        control1 = [
          start[0] + dx * 0.1 + perp[0] * handleLen * 0.5,
          start[1] + dy * 0.1 + perp[1] * handleLen * 0.5,
        ] as [number, number]
        control2 = [
          start[0] + dx * 0.9 + perp[0] * handleLen * 0.5,
          start[1] + dy * 0.9 + perp[1] * handleLen * 0.5,
        ] as [number, number]
      }
      island.beziers[j] = { start, control1, control2, end }
    })
  })

  return islands
}

export const COMMODITIES = [
  { name: 'Lumber', baseValue: 10 },
  { name: 'Copper', baseValue: 50 },
  { name: 'Coffee', baseValue: 200 },
  { name: 'Ambergris', baseValue: 500 },
  { name: 'Pearls', baseValue: 1000 },
]

export interface IslandData {
  x: number
  y: number
  offsetX: number
  offsetY: number
  offsetZ: number
  seed: number
  index: number
  name: string
  elevation: number
  size: number
  noise: number
  curve: number
  dockingPoint: { dx: number; dy: number }
  lighthousePosition: { x: number; y: number }
  lighthouseRotation: { y: number }
  neighbours: number[]
  bezierOverrides: Record<
    number,
    {
      control1: [number, number]
      control2: [number, number]
    }
  >
  beziers: {
    [neighbourIdx: number]: {
      start: [number, number]
      control1: [number, number]
      control2: [number, number]
      end: [number, number]
    }
  }
  prices: {
    fuel: number
    // Add other resources here in the future
    [key: string]: number
  }
  cheapResource?: string
  expensiveResource?: string
}

export interface GameState {
  boatState: { x: number; y: number; angle: number }
  count: number
  isLoading: boolean
  seed: number
  spread: number
  buffer: number
  maxTries: number
  drawDistance: number
  islands: IslandData[]
  currentDockingIndex: number
  bezierPath: {
    start: [number, number]
    control1: [number, number]
    control2: [number, number]
    end: [number, number]
  } | null
  inventory: { name: string; value: number }[]
  fuelDistanceTraveled: number
  moveCount: number
  moveBoatToDock: (index: number) => void
  setBoatState: (state: { x: number; y: number; angle: number }) => void
  lighthouseEditMode: 'translate' | 'rotate'
  setLighthouseEditMode: (mode: 'translate' | 'rotate') => void
  saveLighthousePositions: () => void
  showDestinationModal: boolean
  setShowDestinationModal: (show: boolean) => void
  addToInventory: (name: string, amount: number) => void
  subtractFromInventory: (name: string, amount: number) => void
  gameStarted: boolean
  setGameStarted: (started: boolean) => void
  encounterTiming: number | null
  encounterModal: null | {
    text: string
    options: { label: string; onSelect: () => void }[]
  }
  triggerEncounter: () => void
  money: number
  highestMoveCount?: number
  highestMoney?: number
}

function getLocalHighs() {
  return {
    highestMoveCount: Number(
      localStorage.getItem('ice-cold-drink-highestMoveCount') || 0,
    ),
    highestMoney: Number(
      localStorage.getItem('ice-cold-drink-highestMoney') || 0,
    ),
  }
}

export const useGameStore = create<GameState>((set, get) => {
  const count = 10
  const seed = 12345
  const spread = 1500
  const buffer = 300
  const maxTries = 1000
  const drawDistance = 500
  const islands = generateIslands({ count, seed, spread, buffer, maxTries })
  // Boat starts at first docking point
  const startingIsland = STARTING_ISLAND
  const initialBoat = {
    x: islands[startingIsland].x + islands[startingIsland].dockingPoint.dx,
    y: islands[startingIsland].y + islands[startingIsland].dockingPoint.dy,
    angle: Math.PI * 0.5,
  }

  const highs = getLocalHighs()
  const initialState = {
    boatState: initialBoat,
    isLoading: true,
    count,
    seed,
    spread,
    buffer,
    maxTries,
    drawDistance,
    islands,
    currentDockingIndex: STARTING_ISLAND,
    bezierPath: null,
    lighthouseEditMode: 'translate' as 'translate' | 'rotate',
    showDestinationModal: false,
    inventory: [
      { name: 'fuel', value: STARTING_FUEL },
      ...COMMODITIES.map((c) => ({ name: c.name, value: 0 })),
    ],
    fuelDistanceTraveled: 0,
    gameStarted: DEBUG,
    encounterTiming: null,
    encounterModal: null,
    money: STARTING_MONEY,
    moveCount: 0,
    highestMoveCount: highs.highestMoveCount,
    highestMoney: highs.highestMoney,
  }

  function updateHighs(moveCount: number, money: number) {
    const { highestMoveCount, highestMoney } = get()
    let updated = false
    if (moveCount > (highestMoveCount || 0)) {
      localStorage.setItem('ice-cold-drink-highestMoveCount', String(moveCount))
      set({ highestMoveCount: moveCount })
      updated = true
    }
    if (money > (highestMoney || 0)) {
      localStorage.setItem('ice-cold-drink-highestMoney', String(money))
      set({ highestMoney: money })
      updated = true
    }
    return updated
  }

  function getFuelPrice(moveCount: number): number {
    return Math.round(
      10 + 5 * moveCount + 0.75 * Math.pow(Math.max(0, moveCount - 10), 2),
    )
  }

  return {
    ...initialState,
    moveBoatToDock: (index: number) => {
      const islands = get().islands
      const currentIdx = get().currentDockingIndex
      const currentIsland = islands[currentIdx]
      const bezier = currentIsland.beziers[index]
      if (!bezier) return
      // Pick new cheap/expensive resources for each island
      const newIslands = islands.map((island) => {
        const commodityNames = COMMODITIES.map((c) => c.name)
        const cheapIdx = Math.floor(Math.random() * commodityNames.length)
        let expensiveIdx = Math.floor(Math.random() * commodityNames.length)
        while (expensiveIdx === cheapIdx) {
          expensiveIdx = Math.floor(Math.random() * commodityNames.length)
        }
        return {
          ...island,
          cheapResource: commodityNames[cheapIdx],
          expensiveResource: commodityNames[expensiveIdx],
        }
      })
      const moveCount = get().moveCount + 1
      const fuelPrice = getFuelPrice(moveCount)
      const updatedIslands = newIslands.map((island) => ({
        ...island,
        prices: { ...island.prices, fuel: fuelPrice },
      }))
      set({
        bezierPath: bezier,
        currentDockingIndex: index,
        islands: updatedIslands,
        moveCount,
      })
      updateHighs(moveCount, get().money)
    },
    setBoatState: (state) => {
      const prev = get().boatState
      const dist = distance([prev.x, prev.y], [state.x, state.y])
      let fuelDistanceTraveled = get().fuelDistanceTraveled + dist
      let inventory = get().inventory
      let fuelUsed = 0
      while (fuelDistanceTraveled >= FUEL_UNIT_DISTANCE) {
        fuelDistanceTraveled -= FUEL_UNIT_DISTANCE
        fuelUsed++
      }
      if (fuelUsed > 0) {
        const fuel = inventory.find((i) => i.name === 'fuel')?.value ?? 0
        if (fuel <= 0) {
          set({ ...initialState, gameStarted: false })
          return
        }
        inventory = inventory.map((item) =>
          item.name === 'fuel'
            ? { ...item, value: Math.max(0, item.value - fuelUsed) }
            : item,
        )
      }
      set({
        boatState: state,
        fuelDistanceTraveled,
        inventory,
      })
    },
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
        bezierOverrides: Object.fromEntries(
          Object.entries(island.beziers).map(([k, v]) => [
            k,
            { control1: v.control1, control2: v.control2 },
          ]),
        ),
      }))
      console.log('Saving overrides:', positions)
      navigator.clipboard.writeText(JSON.stringify(positions, null, 2))
    },
    addToInventory: (name: string, amount: number) =>
      set((state) => {
        if (name === 'money') {
          const newMoney =
            (state.inventory.find((i) => i.name === 'money')?.value || 0) +
            amount
          updateHighs(state.moveCount, newMoney)
        }
        return {
          inventory: state.inventory.map((item) =>
            item.name === name ? { ...item, value: item.value + amount } : item,
          ),
        }
      }),
    subtractFromInventory: (name: string, amount: number) =>
      set((state) => ({
        inventory: state.inventory.map((item) =>
          item.name === name
            ? { ...item, value: Math.max(0, item.value - amount) }
            : item,
        ),
      })),
    setGameStarted: (started) => set({ gameStarted: started }),

    triggerEncounter: () => {
      const encounter =
        ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)]
      set({
        encounterModal: {
          text: encounter.text,
          options: encounter.options.map((opt) => ({
            label: opt.label,
            onSelect: () => {
              opt.onSelect(get())
              set({
                encounterModal: null,
                encounterTiming: null,
              })
            },
          })),
        },
      })
    },
  }
})
