import * as THREE from 'three'
import crusoe from 'crusoe'
import { useMemo } from 'react'

const RESOLUTION = 42

export function Island({
  x,
  y,
  seed,
  elevation,
  size,
  noise,
  curve,
}: {
  x?: number
  y?: number
  seed?: number
  elevation?: number
  size?: number
  noise?: number
  curve?: number
}) {
  const { geometry, material } = useMemo(() => {
    const map = crusoe.generateMap({
      seed: seed ?? 0,
      size: size ?? 1.3,
      noiseReduction: noise ?? 9,
      elevation: elevation ?? 1,
      curve: curve ?? 1.1,
      width: RESOLUTION,
      height: RESOLUTION,
      lakeSize: 0,
    })
    const width = RESOLUTION
    const height = RESOLUTION

    const geometry = new THREE.PlaneGeometry(width, height, width, height)
    const pos = geometry.getAttribute('position')
    const data = map.data.flat()

    for (let j = 0; j < height + 1; j++) {
      for (let i = 0; i < width + 1; i++) {
        const n = j * height + i
        const nn = j * (height + 1) + i
        const col = data[n] ?? 0
        const m = (col - 0.5) * 20
        pos.setZ(nn, Math.max(m + 9, -1))
      }
    }
    pos.needsUpdate = true
    geometry.computeVertexNormals()

    const material = new THREE.MeshStandardMaterial({
      color: 0x447744,
      flatShading: true,
    })

    return { geometry, material }
  }, [elevation, size, noise, curve, seed])

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[x ?? 0, 0, y ?? 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[2, 2, 2]}
    />
  )
}
