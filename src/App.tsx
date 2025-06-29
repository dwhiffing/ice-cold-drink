import { Canvas } from '@react-three/fiber'
import { UI } from './components/UI'
import { DefaultScene } from './scene/DefaultScene'
import { useEffect, useState } from 'react'
import { DUR, PRIMARY_COLOR } from './utils/constants'
import { clickSound, playSound, toggleMute } from './utils/audio'
import { Menu } from './scene/Menu'
import { useGameStore } from './store/gameStore'

import './index.css'

export default function App() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const setGameStarted = useGameStore((s) => s.setGameStarted)
  const [gameFade, setGameFade] = useState(false)
  const [gameState] = useState('')
  const [menuFade, setMenuFade] = useState(false)

  useEffect(() => {
    if (!gameStarted) {
      setGameFade(false)
      setMenuFade(false)
    }
  }, [gameStarted])

  useEffect(() => {
    setTimeout(() => setGameFade(gameStarted), DUR)
  }, [gameStarted])

  useEffect(() => {
    const onClick = () => {
      // music.play()
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const lowerKey = e.key.toLowerCase()
      if (lowerKey === 'm') {
        e.preventDefault()
        toggleMute()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const onStart = () => {
    setMenuFade(true)
    playSound(clickSound, 0.9, 1.1, 0.35)
    setTimeout(() => setGameStarted(true), DUR)
  }

  return gameStarted ? (
    <>
      <UI>
        <div
          className="transition-all inset-0 fixed z-20"
          style={{
            backgroundColor: gameFade ? 'transparent' : PRIMARY_COLOR,
            transitionDuration: `${gameFade ? DUR : DUR / 2}ms`,
          }}
        />
      </UI>
      <Canvas>
        <DefaultScene />
      </Canvas>
    </>
  ) : (
    <Menu
      fade={menuFade}
      gameState={gameState as 'win' | 'lose'}
      onStart={() => {
        playSound(clickSound, 0.9, 1.1, 0.35)
        onStart()
      }}
    />
  )
}
