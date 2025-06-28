import { PlaneGeometry } from 'three'
import { extend } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'

extend({ PlaneGeometry })

export const Water = () => (
  <mesh position-y={-1.5} rotation-x={Math.PI * -0.5}>
    <planeGeometry args={[2000, 2000]} />
    <MeshReflectorMaterial
      blur={[1024, 500]}
      resolution={1024}
      mixBlur={0.65}
      mixStrength={10}
      mirror={0.8}
      depthScale={0.1}
      minDepthThreshold={0.5}
      maxDepthThreshold={1}
      color={'#11a5a3'}
      metalness={0.6}
    />
  </mesh>
)
