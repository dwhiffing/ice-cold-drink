import React from 'react'

interface Bezier {
  start: [number, number]
  control: [number, number]
  end: [number, number]
}

interface Island {
  beziers: Record<number, Bezier>
  neighbours: number[]
  x: number
  y: number
}

interface BezierRendererProps {
  islands: Island[]
}

export const BezierRenderer: React.FC<BezierRendererProps> = ({ islands }) => {
  if (!islands || islands.length === 0) return null
  const curves: React.ReactElement[] = []
  const seen = new Set<string>()
  islands.forEach((island, i) => {
    island.neighbours.forEach((j) => {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (seen.has(key)) return
      seen.add(key)
      const bezier = island.beziers[j]
      if (!bezier) return
      const points = Array.from({ length: 64 }, (_, k) => {
        const t = k / 63
        const mt = 1 - t
        const x =
          mt * mt * bezier.start[0] +
          2 * mt * t * bezier.control[0] +
          t * t * bezier.end[0]
        const y =
          mt * mt * bezier.start[1] +
          2 * mt * t * bezier.control[1] +
          t * t * bezier.end[1]
        return [x, 0.3, y]
      }).flat()
      curves.push(
        <line key={key}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(points), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="cyan" linewidth={2} />
        </line>,
      )
    })
  })
  return <group>{curves}</group>
}
