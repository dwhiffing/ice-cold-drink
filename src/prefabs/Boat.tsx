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

  function cubicBezierInterp(
    t: number,
    p0: [number, number],
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
  ) {
    const mt = 1 - t
    const x =
      mt * mt * mt * p0[0] +
      3 * mt * mt * t * p1[0] +
      3 * mt * t * t * p2[0] +
      t * t * t * p3[0]
    const y =
      mt * mt * mt * p0[1] +
      3 * mt * mt * t * p1[1] +
      3 * mt * t * t * p2[1] +
      t * t * t * p3[1]
    return [x, y]
  }

  function easeInOut(t: number) {
    // Cubic ease-in-out
    return t * t * (3 - 2 * t)
  }

  const setBezierPath = useGameStore.setState as (
    state: Partial<{ bezierPath: null }>,
  ) => void

  useFrame(() => {
    if (bezierPath) {
      // Animate t from 0 to 1 based on speed
      const speed = 0.001
      tRef.current = Math.min(1, tRef.current + speed)
      const tEased = easeInOut(tRef.current)
      const [bx, by] = cubicBezierInterp(
        tEased,
        bezierPath.start,
        bezierPath.control1,
        bezierPath.control2,
        bezierPath.end,
      )
      // Compute tangent for angle
      const t2 = Math.min(1, tRef.current + 0.01)
      const t2Eased = easeInOut(t2)
      const [bx2, by2] = cubicBezierInterp(
        t2Eased,
        bezierPath.start,
        bezierPath.control1,
        bezierPath.control2,
        bezierPath.end,
      )
      const angle = Math.atan2(bx2 - bx, by2 - by) + Math.PI / 2
      stateRef.current = { ...stateRef.current, x: bx, y: by, angle }
      setBoatState({ x: bx, y: by, angle })
      if (tRef.current >= 1) {
        tRef.current = 0
        setBezierPath({ bezierPath: null })
        // Show destination modal when boat arrives
        useGameStore.getState().setShowDestinationModal(true)
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
