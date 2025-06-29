import { Canvas } from '@react-three/fiber'
import { UI } from './components/UI'
import { DefaultScene } from './scene/DefaultScene'
import { useEffect, useState } from 'react'
import { DUR, PRIMARY_COLOR } from './utils/constants'
import { Menu } from './scene/Menu'
import { useGameStore } from './store/gameStore'

import './index.css'

export default function App() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const setGameStarted = useGameStore((s) => s.setGameStarted)
  const isLoading = useGameStore((s) => s.isLoading)
  const [gameFade, setGameFade] = useState(false)
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
        // toggleMute()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const onStart = () => {
    setMenuFade(true)
    setTimeout(() => setGameStarted(true), DUR)
  }

  return gameStarted ? (
    <>
      <UI>
        <div
          className="transition-all inset-0 fixed z-[-1] flex justify-center items-center text-white text-2xl"
          style={{
            backgroundColor: gameFade ? 'transparent' : PRIMARY_COLOR,
            transitionDuration: `${gameFade ? DUR : DUR / 2}ms`,
          }}
        >
          {isLoading && <p>Loading...</p>}
        </div>
      </UI>
      <Canvas>
        <DefaultScene />
      </Canvas>
    </>
  ) : (
    <Menu
      fade={menuFade}
      onStart={() => {
        onStart()
      }}
    />
  )
}
