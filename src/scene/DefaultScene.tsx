import { useEffect, useState } from 'react'
import { Physics } from '@react-three/cannon'
import { Plane } from '../prefabs/Plane'
import { FOG_DISTANCE, PLAYER, PRIMARY_COLOR } from '../utils/constants'
import { Boat } from '../prefabs/Boat'
import { Player } from '../prefabs/Player'
import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Islands } from '../prefabs/Islands'


export const DefaultScene = () => {
  const { controls } = useThree()
  const [boatPos, setBoatPos] = useState({ x: 2, y: 2, angle: Math.PI * 0.5 })

  useEffect(() => {
    const _controls = controls as CameraControls
    const distanceBehind = 5
    const cameraHeight = 1
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

  // useFrame(() => {
  //   setBoatPos((prev) => ({ ...prev, angle: prev.angle + 0 }))
  // })

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
      <Physics
        gravity={[0, -1.7, 0]}
        tolerance={0}
        iterations={10}
        broadphase={'SAP'}
      >
        {PLAYER && <Player />}
        <Plane />
      </Physics>

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
