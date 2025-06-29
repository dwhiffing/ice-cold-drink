import { Float } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js'
import { useGameStore } from '../store/gameStore'

export const Boat = ({
  x,
  y,
  angle,
  setBoatState,
}: {
  x: number
  y: number
  angle: number
  setBoatState: (state: { x: number; y: number; angle: number }) => void
}) => {
  const materials = useLoader(MTLLoader, 'boat/boat.mtl')
  const obj = useLoader(OBJLoader, 'boat/boat.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })
  const stateRef = useRef({ x, y, angle, speed: 0 })
  const bezierPath = useGameStore((s) => s.bezierPath)
  const tRef = useRef(0)

  function bezierInterp(
    t: number,
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
  ) {
    const x =
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
    const y =
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    return [x, y]
  }

  const setBezierPath = useGameStore.setState as (
    state: Partial<{ bezierPath: null }>,
  ) => void

  useFrame(() => {
    if (bezierPath) {
      // Animate t from 0 to 1 based on speed
      const speed = 0.01
      tRef.current = Math.min(1, tRef.current + speed)
      const [bx, by] = bezierInterp(
        tRef.current,
        bezierPath.start,
        bezierPath.control,
        bezierPath.end,
      )
      // Compute tangent for angle
      const t2 = Math.min(1, tRef.current + 0.01)
      const [bx2, by2] = bezierInterp(
        t2,
        bezierPath.start,
        bezierPath.control,
        bezierPath.end,
      )
      const angle = Math.atan2(bx2 - bx, by2 - by) + Math.PI / 2
      stateRef.current = { ...stateRef.current, x: bx, y: by, angle }
      setBoatState({ x: bx, y: by, angle })
      if (tRef.current >= 1) {
        tRef.current = 0
        setBezierPath({ bezierPath: null })
      }
      return
    }
  })

  return (
    <group
      position={[x, -2.05, y]}
      rotation={[-Math.PI / 2, 0, angle]}
      scale={0.003}
    >
      <Float
        speed={5}
        rotationIntensity={0.1}
        floatIntensity={0.05}
        floatingRange={[-1.5, 0]}
      >
        <mesh>
          <primitive object={obj} />
        </mesh>
      </Float>
    </group>
  )
}
