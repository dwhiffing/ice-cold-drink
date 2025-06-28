import * as THREE from 'three'
import crusoe from 'crusoe'
import { useMemo } from 'react'

const ISLAND_OPTIONS = {
  sharpness: 0.1,
  size: 0.8,
  resolution: 120 * 0.7,
  noise: 9.0,
  elevation: 0.7,
  lakeSize: 2.0,
  curve: 2.0,
}

export default function Island({
  options,
}: {
  options?: typeof ISLAND_OPTIONS
}) {
  const opts = options || ISLAND_OPTIONS
  const { geometry, material } = useMemo(() => {
    const map = crusoe.generateMap({
      seed: 0,
      width: opts.resolution,
      height: opts.resolution,
      size: opts.size,
      noiseReduction: opts.noise,
      elevation: opts.elevation,
      lakeSize: opts.lakeSize,
      curve: opts.curve,
    })
    const width = map.width
    const height = map.height

    const geometry = new THREE.PlaneGeometry(width, height, width, height)
    const pos = geometry.getAttribute('position')
    const data = map.data.flat()
    for (let j = 0; j < height + 1; j++) {
      for (let i = 0; i < width + 1; i++) {
        const n = j * height + i
        const nn = j * (height + 1) + i
        const col = data[n] ?? 0
        const m = (col - 0.5) * 20
        pos.setZ(nn, m + 0)
      }
    }
    pos.needsUpdate = true
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({
      color: 0x447744,
      flatShading: true,
    })
    return { geometry, material }
  }, [opts])

  return (
    <mesh
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[2, 2, 2]}
    />
  )
}
