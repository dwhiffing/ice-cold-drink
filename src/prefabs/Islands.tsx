import { Island } from './Island'
import { Lighthouse } from './Lighthouse'

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

export function Islands({
  count = 50,
  seed = 12345,
  spread = 2000,
  buffer = 240,
  maxTries = 1000,
  boatX = 0,
  boatY = 0,
  drawDistance = 500,
}: {
  count?: number
  seed?: number
  spread?: number
  buffer?: number
  maxTries?: number
  boatX?: number
  boatY?: number
  drawDistance?: number
} = {}) {
  const rand = mulberry32(seed)
  const positions: [number, number][] = []
  for (let i = 0; i < count; i++) {
    let tries = 0
    let x = 0,
      y = 0
    let ok = false
    while (tries < maxTries && !ok) {
      x = (rand() - 0.5) * spread
      y = (rand() - 0.5) * spread
      ok = positions.every(([px, py]) => distance([x, y], [px, py]) >= buffer)
      tries++
    }
    if (ok) {
      positions.push([x, y])
    }
  }
  const islands = positions
    .map(([x, y], i) => ({ x, y, i }))
    .filter(({ x, y }) => distance([x, y], [boatX, boatY]) <= drawDistance)
    .map(({ x, y, i }) => (
      <>
        <Island key={i} x={x} y={y} seed={seed + i} />
        <Lighthouse x={x} y={y} />
      </>
    ))
  return <>{islands}</>
}
