import { useLoader } from '@react-three/fiber'

import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js'

export const Boat = ({ position }: { position: number[] }) => {
  const materials = useLoader(MTLLoader, 'boat/boat.mtl')
  const obj = useLoader(OBJLoader, 'boat/boat.obj', (loader) => {
    materials.preload()
    loader.setMaterials(materials)
  })

  return (
    <mesh
      position={[position[0], position[1] - 1.9, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={0.003}
    >
      <primitive object={obj} />
    </mesh>
  )
}
