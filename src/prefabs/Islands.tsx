import { Island } from './Island'
import { Lighthouse } from './Lighthouse'
import { useGameStore } from '../store/gameStore'
import React from 'react'

export function Islands() {
  const { islands, showDockingPoints } = useGameStore()

  const islandEls = islands.map((island, i) => (
    <React.Fragment key={i}>
      <Island
        key={i}
        x={island.x}
        y={island.y}
        seed={island.seed}
        elevation={island.elevation}
        size={island.size}
        noise={island.noise}
        curve={island.curve}
        dockingPoint={island.dockingPoint}
        showDockingPoint={showDockingPoints}
      />
      <Lighthouse x={island.x} y={island.y} />
    </React.Fragment>
  ))
  return <>{islandEls}</>
}
