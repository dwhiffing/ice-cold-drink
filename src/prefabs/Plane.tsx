import { usePlane } from '@react-three/cannon'
import { PlaneGeometry, TextureLoader } from 'three'
import { extend, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Reflector } from 'three/examples/jsm/Addons.js'
import { useRef, useEffect } from 'react'
import { Object3D } from 'three'
// @ts-expect-error glslify
import vertexShader from '../glsl/reflector.vert'
// @ts-expect-error glslify
import fragmentShader from '../glsl/reflector.frag'
import { PRIMARY_COLOR } from '../utils/constants'

extend({ PlaneGeometry })
export const Plane = () => {
  const { scene } = useThree()
  const t = useLoader(TextureLoader, 'waterdudv.jpg')
  const y = -1.5
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, y, 0],
    material: { friction: 0.1 },
  }))

  const reflectorRef = useRef<Object3D | null>(null)

  useFrame((state) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reflector = reflectorRef.current as any
    if (reflector.material.uniforms.time) {
      reflector.material.uniforms.time.value = state.clock.getElapsedTime()
    }
  })

  useEffect(() => {
    if (reflectorRef.current) return
    t.wrapS = t.wrapT = 1000 // Repeat texture

    const customShader = {
      name: 'ReflectorShader',
      vertexShader,
      fragmentShader,
      uniforms: {
        tDiffuse: { value: null },
        color: { value: null },
        textureMatrix: { value: null },
        tDudv: { value: t },
        time: { value: 0 },
      },
    }
    const geo = new PlaneGeometry(100, 100)

    const reflector = new Reflector(geo, {
      shader: customShader,
      color: PRIMARY_COLOR,
      textureWidth: 1024,
      textureHeight: 1024,
      clipBias: 0.003,
    })
    reflector.rotation.x = -Math.PI / 2
    reflector.position.y = y

    scene.add(reflector)
    reflectorRef.current = reflector
    return () => {
      reflectorRef.current = null
      scene.remove(reflector)
    }
  }, [scene, y, t])

  return <mesh ref={ref} visible={false} />
}
