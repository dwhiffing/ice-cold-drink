import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { PulsingLight } from './PulsingLight'

export const Lighthouse = ({ x, y }: { x: number; y: number }) => {
  const obj = useLoader(GLTFLoader, 'lighthouse/scene.gltf')

  return (
    <group>
      <primitive
        position={[x, 0.5, y]}
        rotation={[0, 0, 0]}
        scale={1}
        object={clone(obj.scene)}
      />
      <PulsingLight color="#ff0000" position={[x, 9.3, y]} />
    </group>
  )
}
