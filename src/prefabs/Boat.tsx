import { Float } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js'

function stoppingDistance(speed: number, acceleration: number) {
  return (speed * speed) / (2 * acceleration)
}

export const Boat = ({
  x,
  y,
  angle,
  target,
  setBoatState,
}: {
  x: number
  y: number
  angle: number
  target: { x: number; y: number; angle: number }
  setBoatState: (state: { x: number; y: number; angle: number }) => void
}) => {
  const materials = useLoader(MTLLoader, 'boat/boat.mtl')
  const obj = useLoader(OBJLoader, 'boat/boat.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })
  const ACCELERATION = 0.002
  const MAX_SPEED = 0.5
  const ANGLE_SPEED = 0.1
  const stateRef = useRef({ x, y, angle, speed: 0 })

  useFrame(() => {
    const dx = target.x - stateRef.current.x
    const dy = target.y - stateRef.current.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < 1) {
      stateRef.current.speed = 0
      return
    }

    const stopDist = stoppingDistance(stateRef.current.speed, ACCELERATION)
    const shouldAccelerate = dist > stopDist + 0.5

    if (shouldAccelerate) {
      stateRef.current.speed = Math.min(
        stateRef.current.speed + ACCELERATION,
        MAX_SPEED,
      )
    } else {
      stateRef.current.speed = Math.max(
        stateRef.current.speed - ACCELERATION,
        0,
      )
    }
    let targetAngle = stateRef.current.angle

    let newX = stateRef.current.x
    let newY = stateRef.current.y
    if (stateRef.current.speed > 0) {
      const dirX = dx / dist
      const dirY = dy / dist
      newX += dirX * stateRef.current.speed
      newY += dirY * stateRef.current.speed
    }
    if (dist > 0.001) {
      targetAngle = Math.atan2(dx, dy) + Math.PI / 2
    }
    let deltaA = targetAngle - stateRef.current.angle
    if (deltaA > Math.PI) deltaA -= Math.PI * 2
    if (deltaA < -Math.PI) deltaA += Math.PI * 2
    let newAngle =
      stateRef.current.angle +
      Math.max(-ANGLE_SPEED, Math.min(ANGLE_SPEED, deltaA))
    if (Math.abs(deltaA) < 0.01) newAngle = targetAngle

    stateRef.current = {
      ...stateRef.current,
      x: newX,
      y: newY,
      angle: newAngle,
    }
    setBoatState({ x: newX, y: newY, angle: newAngle })
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
