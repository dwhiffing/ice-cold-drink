import { useEffect, useRef } from 'react'
import { Physics } from '@react-three/cannon'
import { extend, useThree } from '@react-three/fiber'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { Plane } from '../prefabs/Plane'
import { Player } from '../prefabs/Player'
import { useMouseInput } from '../hooks/useMouseInput'
import { DEBUG, FOG_DISTANCE } from '../utils/constants'
import { Boat } from '../prefabs/Boat'

extend({ PointerLockControls })

export const DefaultScene = () => {
  const { camera, gl } = useThree()
  const controls = useRef<PointerLockControls>(null)

  // pointer lock
  useEffect(() => {
    const handleFocus = () => controls.current?.lock()
    if (!DEBUG) controls.current?.lock()
    document.addEventListener('click', handleFocus)
    return () => {
      document.removeEventListener('click', handleFocus)
    }
  }, [])

  useMouseInput(
    // on down
    () => {},
    // on up
    () => {},
    // on move
    () => {},
  )

  // useFrame(() => {})

  return (
    <>
      <fog attach="fog" args={['#557582', 1, FOG_DISTANCE]} />
      <color attach="background" args={['#557582']} />
      <directionalLight
        color="#ffffff"
        position={[0, 10, 10]}
        intensity={0.6}
      />

      <ambientLight color="#557582" intensity={2} />
      <Physics
        gravity={[0, -1.7, 0]}
        tolerance={0}
        iterations={10}
        broadphase={'SAP'}
      >
        <Player />
        <Plane />
      </Physics>
      <Boat position={[0, 0, 0]} />

      {/* @ts-expect-error pointer lock */}
      <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
    </>
  )
}
