import { useEffect, useState } from 'react'
import { Water } from '../prefabs/Water'
import { FOG_DISTANCE, PRIMARY_COLOR } from '../utils/constants'
import { Boat } from '../prefabs/Boat'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Islands } from '../prefabs/Islands'

const LOOK_OVERHEAD = false

export const DefaultScene = () => {
  const { controls } = useThree()
  const [boatPos, setBoatPos] = useState({ x: 2, y: 2, angle: Math.PI * 0.5 })

  useEffect(() => {
    const _controls = controls as CameraControls
    const distanceBehind = LOOK_OVERHEAD ? 0 : 5
    const cameraHeight = LOOK_OVERHEAD ? 100 : 1
    const angleBehind = boatPos.angle - Math.PI / 2
    const behindX = boatPos.x - distanceBehind * Math.sin(angleBehind)
    const behindZ = boatPos.y - distanceBehind * Math.cos(angleBehind)
    _controls?.setLookAt(
      behindX,
      cameraHeight,
      behindZ,
      boatPos.x,
      0,
      boatPos.y,
      true,
    )
  }, [boatPos, controls])

  return (
    <>
      <fog attach="fog" args={[PRIMARY_COLOR, 1, FOG_DISTANCE]} />
      <color attach="background" args={[PRIMARY_COLOR]} />
      <directionalLight
        color="#ffffff"
        position={[0, 10, 10]}
        intensity={0.6}
      />

      <ambientLight color={PRIMARY_COLOR} intensity={2} />

      <Water />
      <Islands />
      <Boat x={boatPos.x} y={boatPos.y} angle={boatPos.angle} />
      <CameraControls
        makeDefault
        // mouseButtons={{ left: 0, middle: 0, right: 0, wheel: 0 }}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}
