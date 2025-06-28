import { Island } from './Island'
import { Lighthouse } from './Lighthouse'
import { useGameStore } from '../store/gameStore'
import React from 'react'

export function Islands() {
  const { positions, seed, showDockingPoints } = useGameStore()

  const islands = positions.map(([x, y], i) => (
    <React.Fragment key={i}>
      <Island
        key={i}
        x={x}
        y={y}
        seed={seed + i}
        showDockingPoint={showDockingPoints}
      />
      <Lighthouse x={x} y={y} />
    </React.Fragment>
  ))
  return <>{islands}</>
}
