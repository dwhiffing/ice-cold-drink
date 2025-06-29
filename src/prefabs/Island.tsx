import * as THREE from 'three'
import crusoe from 'crusoe'
import { useMemo } from 'react'
import { Lighthouse } from './Lighthouse'
import { TransformControls } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'

const RESOLUTION = 42

export function Island({
  x,
  y,
  seed,
  index,
  elevation,
  size,
  noise,
  curve,
  dockingPoint,
  lighthousePosition,
  lighthouseRotation = { y: 0 },
  showDockingPoint = true,
}: {
  x: number
  y: number
  index: number
  seed: number
  elevation: number
  size: number
  noise: number
  curve: number
  dockingPoint: { dx: number; dy: number }
  lighthousePosition: { x: number; y: number }
  lighthouseRotation?: { y: number }
  showDockingPoint?: boolean
}) {
  const islands = useGameStore((s) => s.islands)
  const setIslands = useGameStore.setState as (
    state: Partial<{ islands: typeof islands }>,
  ) => void
  const mode = useGameStore((s) => s.lighthouseEditMode)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: any) => {
    if (!e || !e.target?.object?.position || !e.target?.object?.rotation) return
    const pos = e.target.object.position
    const rot = e.target.object.rotation
    const newIslands = islands.map((island, i) =>
      i === index
        ? {
            ...island,
            lighthousePosition: { x: pos.x - x, y: pos.z - y },
            lighthouseRotation: { y: rot.y },
          }
        : island,
    )

    setIslands({ islands: newIslands })
  }

  const { geometry, material } = useMemo(() => {
    const map = crusoe.generateMap({
      seed,
      size,
      noiseReduction: noise,
      elevation,
      curve,
      width: RESOLUTION,
      height: RESOLUTION,
      lakeSize: 0,
    })
    const width = RESOLUTION
    const height = RESOLUTION
    const geometry = new THREE.PlaneGeometry(width, height, width, height)
    const pos = geometry.getAttribute('position')
    const data = map.data.flat()
    for (let j = 0; j < height + 1; j++) {
      for (let i = 0; i < width + 1; i++) {
        const n = j * height + i
        const nn = j * (height + 1) + i
        const col = data[n] ?? 0
        const m = (col - 0.5) * 20
        pos.setZ(nn, Math.max(m + 9, -1))
      }
    }
    pos.needsUpdate = true
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({
      color: 0x447744,
      flatShading: true,
    })
    return { geometry, material }
  }, [elevation, size, noise, curve, seed])

  return (
    <>
      <group position={[x, 0, y]}>
        <mesh
          geometry={geometry}
          material={material}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[2, 2, 2]}
        />

        {showDockingPoint && (
          <mesh position={[dockingPoint.dx, 0, dockingPoint.dy]}>
            <sphereGeometry args={[2, 16, 16]} />
            <meshStandardMaterial color="yellow" />
          </mesh>
        )}
      </group>
      <TransformControls
        position={[x + lighthousePosition.x, 0, y + lighthousePosition.y]}
        rotation={[0, lighthouseRotation.y, 0]}
        mode={mode}
        onMouseUp={handleChange}
        showX={mode !== 'rotate'}
        showY={mode === 'rotate'}
        showZ={mode !== 'rotate'}
      >
        <Lighthouse />
      </TransformControls>
    </>
  )
}
