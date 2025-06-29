import { DebugTransform } from './DebugTransform'
import React from 'react'
import { useGameStore } from '../store/gameStore'

interface Bezier {
  start: [number, number]
  control1: [number, number]
  control2: [number, number]
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
  const updateBezierControl = (
    islandIdx: number,
    neighbourIdx: number,
    which: 'control1' | 'control2',
    newControl: [number, number],
  ) => {
    useGameStore.setState((state) => {
      const islandsCopy = state.islands.map((island, i) => {
        if (i !== islandIdx) return island
        return {
          ...island,
          beziers: {
            ...island.beziers,
            [neighbourIdx]: {
              ...island.beziers[neighbourIdx],
              [which]: newControl,
            },
          },
        }
      })
      return { islands: islandsCopy }
    })
  }

  if (!islands || islands.length === 0) return null
  const curves: React.ReactElement[] = []
  const handles: React.ReactElement[] = []
  const seen = new Set<string>()
  const boat = useGameStore.getState().boatState
  islands.forEach((island, i) => {
    // Only render for islands within 100 units of the boat
    const dx = island.x - boat.x
    const dy = island.y - boat.y
    if (dx * dx + dy * dy > 100 * 100) return

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
          mt * mt * mt * bezier.start[0] +
          3 * mt * mt * t * bezier.control1[0] +
          3 * mt * t * t * bezier.control2[0] +
          t * t * t * bezier.end[0]
        const y =
          mt * mt * mt * bezier.start[1] +
          3 * mt * mt * t * bezier.control1[1] +
          3 * mt * t * t * bezier.control2[1] +
          t * t * t * bezier.end[1]
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
      handles.push(
        <React.Fragment key={key + '-handles'}>
          {/* Start handle */}
          <DebugTransform
            showY={false}
            position={[bezier.control1[0], 0.3, bezier.control1[1]]}
            onMouseUp={(event) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const controls = event?.target as any
              const object = controls.object
              if (object) {
                const pos = object.position
                updateBezierControl(i, j, 'control1', [pos.x, pos.z])
              }
            }}
          >
            <mesh key={key + '-control1'}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshBasicMaterial color="red" />
            </mesh>
          </DebugTransform>
          {/* End handle */}
          <DebugTransform
            position={[bezier.control2[0], 0.3, bezier.control2[1]]}
            showY={false}
            onMouseUp={(event) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const controls = event?.target as any
              const object = controls.object
              if (object) {
                const pos = object.position
                updateBezierControl(i, j, 'control2', [pos.x, pos.z])
              }
            }}
          >
            <mesh key={key + '-control2'}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshBasicMaterial color="blue" />
            </mesh>
          </DebugTransform>
        </React.Fragment>,
      )
    })
  })

  return (
    <group>
      {curves}
      {handles}
    </group>
  )
}
