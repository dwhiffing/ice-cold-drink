import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PulsingLight } from './PulsingLight'

export const Lighthouse = () => {
  const obj = useLoader(GLTFLoader, 'lighthouse/scene.gltf')

  return (
    <group>
      <primitive position={[0, 0.5, 0]} scale={1} object={clone(obj.scene)} />
      <PulsingLight color="#ff0000" position={[0, 9.5, 0]} />
    </group>
  )
}
