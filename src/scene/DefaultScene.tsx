import { useCallback, useEffect } from 'react'
import { Water } from '../prefabs/Water'
import { FOG_DISTANCE, PRIMARY_COLOR } from '../utils/constants'
import { Boat } from '../prefabs/Boat'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Islands } from '../prefabs/Islands'
import { useGameStore } from '../store/gameStore'

export const DefaultScene = () => {
  const { controls } = useThree()
  const boatPos = useGameStore((s) => s.boatState)

  const updateCamera = useCallback(() => {
    const _controls = controls as CameraControls
    const angleBehind = boatPos.angle - Math.PI / 2
    const behindX = boatPos.x - 9 * Math.sin(angleBehind)
    const behindZ = boatPos.y - 9 * Math.cos(angleBehind)
    _controls?.setPosition(behindX, 1, behindZ, true)
  }, [boatPos, controls])

  useEffect(() => {
    const _controls = controls as CameraControls
    _controls?.setOrbitPoint(boatPos.x, 0, boatPos.y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls])

  useEffect(() => {
    updateCamera()
  }, [updateCamera])

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
        mouseButtons={{ left: 1, middle: 16, right: 0, wheel: 16 }}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        maxDistance={15}
        minDistance={5}
      />
    </>
  )
}
