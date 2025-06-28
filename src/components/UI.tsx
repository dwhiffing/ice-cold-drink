import { ReactNode } from 'react'
import { useGameStore } from '../store/gameStore'

export const UI = ({ children }: { children: ReactNode }) => {
  const currentDockingIndex = useGameStore((s) => s.currentDockingIndex)
  return (
    <div
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        zIndex: '100',
      }}
    >
      <div
        style={{
          color: 'white',
          padding: '8px 16px',
        }}
      >
        Dock: {currentDockingIndex + 1}
      </div>
      {children}
    </div>
  )
}
