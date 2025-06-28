import { Float } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'

import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js'

export const Boat = ({
  x,
  y,
  angle,
}: {
  x: number
  y: number
  angle: number
}) => {
  const materials = useLoader(MTLLoader, 'boat/boat.mtl')
  const obj = useLoader(OBJLoader, 'boat/boat.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  return (
    <Float
      speed={5}
      rotationIntensity={0.05}
      floatIntensity={0.01}
      floatingRange={[-1.5, 0]}
    >
      <mesh
        position={[x, -2.05, y]}
        rotation={[-Math.PI / 2, 0, angle]}
        scale={0.003}
      >
        <primitive object={obj} />
      </mesh>
    </Float>
  )
}
