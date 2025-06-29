import { useCallback, useEffect } from 'react'
import { Water } from '../prefabs/Water'
import { FOG_DISTANCE, PRIMARY_COLOR } from '../utils/constants'
import { Boat } from '../prefabs/Boat'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useGameStore } from '../store/gameStore'
import { useKeyboardInput } from '../hooks/useKeyboardInput'
import { Island } from '../prefabs/Island'

export const DefaultScene = () => {
  const { controls } = useThree()
  const boatPos = useGameStore((s) => s.boatState)
  const boatTarget = useGameStore((s) => s.boatTarget)
  const setBoatState = useGameStore((s) => s.setBoatState)
  const moveBoatToNextDock = useGameStore((s) => s.moveBoatToNextDock)
  const moveBoatToPrevDock = useGameStore((s) => s.moveBoatToPrevDock)
  const keys = useKeyboardInput(['ArrowLeft', 'ArrowRight'])
  const lighthouseEditMode = useGameStore((s) => s.lighthouseEditMode)
  const setLighthouseEditMode = useGameStore((s) => s.setLighthouseEditMode)
  const saveLighthousePositions = useGameStore((s) => s.saveLighthousePositions)
  const { islands } = useGameStore()

  const updateCamera = useCallback(() => {
    const _controls = controls as CameraControls
    const angleBehind = boatPos.angle - Math.PI / 2
    const behindX = boatPos.x - 9 * Math.sin(angleBehind)
    const behindZ = boatPos.y - 9 * Math.cos(angleBehind)
    _controls?.setLookAt(behindX, 1, behindZ, boatPos.x, 0, boatPos.y, false)
  }, [boatPos, controls])

  useEffect(() => {
    updateCamera()
  }, [updateCamera])

  useEffect(() => {
    if (keys.arrowright) moveBoatToNextDock()
    if (keys.arrowleft) moveBoatToPrevDock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.arrowright, keys.arrowleft])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (e.key.toLowerCase() === 'r') {
        setLighthouseEditMode(
          lighthouseEditMode === 'translate' ? 'rotate' : 'translate',
        )
      }
      if (e.key.toLowerCase() === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        saveLighthousePositions()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lighthouseEditMode, setLighthouseEditMode, saveLighthousePositions])

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
      {islands.map((island, i) => (
        <Island
          key={i}
          {...island}
          index={i}
          lighthouseRotation={island.lighthouseRotation}
          showDockingPoint={true}
        />
      ))}
      <Boat
        x={boatPos.x}
        y={boatPos.y}
        angle={boatPos.angle}
        target={boatTarget}
        setBoatState={setBoatState}
      />
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
