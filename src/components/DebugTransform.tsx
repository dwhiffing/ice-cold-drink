import React, { ReactElement } from 'react'
import { TransformControls } from '@react-three/drei'
import { DEBUG } from '../utils/constants'

export type TransformMode = 'translate' | 'rotate' | 'scale'

interface DebugTransformProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  mode?: TransformMode
  showX?: boolean
  showY?: boolean
  showZ?: boolean
  onMouseUp?: (event: React.SyntheticEvent) => void
  children: ReactElement
}

export const DebugTransform: React.FC<DebugTransformProps> = ({
  position,
  rotation,
  mode,
  showX,
  showY,
  showZ,
  onMouseUp,
  children,
}) => {
  if (DEBUG) {
    return (
      <TransformControls
        position={position}
        rotation={rotation}
        mode={mode}
        showX={showX}
        showY={showY}
        showZ={showZ}
        onMouseUp={onMouseUp}
      >
        {children}
      </TransformControls>
    )
  }
  return (
    <group position={position} rotation={rotation}>
      {children}
    </group>
  )
}
