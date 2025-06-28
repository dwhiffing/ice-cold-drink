import { useSphere } from '@react-three/cannon'
import { useEffect, useRef } from 'react'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useKeyboardInput } from '../hooks/useKeyboardInput'
import { useVariable } from '../hooks/useVariable'
import { jumpSound, playSound } from '../utils/audio'
import { useRefreshRate } from '../hooks/useRefreshRate'
import { PointerLockControls } from 'three/examples/jsm/Addons.js'
import { DEBUG } from '../utils/constants'

/** Player movement constants */
const _speed = 10
const jumpSpeed = 0.75

extend({ PointerLockControls })
export const Player = () => {
  const x = 3 * 0.4 + 2
  const y = -1.46
  const refreshRate = useRefreshRate()
  const speed = _speed * (refreshRate / 60)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_ref, api] = useSphere(() => ({
    mass: 100,
    fixedRotation: true,
    position: [x, y, x],
    args: [0.02],
    material: { friction: 0, restitution: 0 },
  }))

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

  const pressed = useKeyboardInput([
    'w',
    'a',
    's',
    'd',
    'arrowup',
    'arrowleft',
    'arrowright',
    'arrowdown',
    'control',
    'shift',
    ' ',
  ])
  const input = useVariable(pressed)

  const { camera, gl } = useThree()

  const state = useRef({
    vel: [0, 0, 0],
    pos: [0, 0, 0],
  })

  useEffect(() => {
    api.velocity.subscribe((v) => (state.current.vel = v))
    api.position.subscribe((v) => (state.current.pos = v))
    setTimeout(() => {
      camera.lookAt(new Vector3(0, 0, 0))
    }, 500)
  }, [api, camera])

  useFrame((_, delta) => {
    const {
      w,
      s,
      a,
      d,
      arrowdown,
      arrowleft,
      arrowright,
      arrowup,
      control,
      shift,
    } = input.current
    const space = input.current[' ']

    const velocity = new Vector3(0, 0, 0)
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)

    const forward = new Vector3()
    forward.setFromMatrixColumn(camera.matrix, 0)
    forward.crossVectors(camera.up, forward)

    const right = new Vector3()
    right.setFromMatrixColumn(camera.matrix, 0)

    let [horizontal, vertical] = [0, 0]

    const isJumping = space || control || shift

    if (w || arrowup) {
      vertical += 1
    }
    if (s || arrowdown) {
      vertical -= 1
    }
    if (d || arrowright) {
      horizontal += 1
    }
    if (a || arrowleft) {
      horizontal -= 1
    }

    if (horizontal !== 0 && vertical !== 0) {
      velocity
        .add(forward.clone().multiplyScalar(speed * vertical))
        .add(right.clone().multiplyScalar(speed * horizontal))
      velocity.clampLength(-speed, speed)
    } else if (horizontal !== 0) {
      velocity.add(right.clone().multiplyScalar(speed * horizontal))
    } else if (vertical !== 0) {
      velocity.add(forward.clone().multiplyScalar(speed * vertical))
    }

    api.velocity.set(
      Math.min(speed, (state.current.vel[0] + velocity.x * delta) * 0.9),
      isJumping ? jumpSpeed : state.current.vel[1],
      Math.min(speed, (state.current.vel[2] + velocity.z * delta) * 0.9),
    )

    camera.position.set(
      state.current.pos[0],
      state.current.pos[1] + 0.15,
      state.current.pos[2],
    )

    if (isJumping) {
      playSound(jumpSound, 0.6, 0.7, 0.2)
    }
  })

  return (
    <>
      {/* @ts-expect-error pointer lock */}
      <pointerLockControls ref={controls} args={[camera, gl.domElement]} />
    </>
  )
}
