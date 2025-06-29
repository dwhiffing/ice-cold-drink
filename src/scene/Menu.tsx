import { useGameStore } from '../store/gameStore'
import { DUR, PRIMARY_COLOR } from '../utils/constants'

export function Menu(props: { onStart: () => void; fade: boolean }) {
  const highestMoveCount = useGameStore((s) => s.highestMoveCount ?? 0)
  const highestMoney = useGameStore((s) => s.highestMoney ?? 0)
  return (
    <div
      className="flex justify-center items-center h-screen text-white"
      style={{ backgroundColor: PRIMARY_COLOR }}
    >
      <div
        className="transition-all inset-0 fixed z-20"
        style={{
          transitionDuration: `${DUR}ms`,
          backgroundColor: props.fade ? PRIMARY_COLOR : 'transparent',
          pointerEvents: props.fade ? 'auto' : 'none',
        }}
      />
      <div className="flex flex-col items-center text-center gap-4">
        <h3 className="text-3xl font-bold">Ice Cold Drink</h3>
        {(highestMoveCount > 0 || highestMoney > 0) && (
          <div className="text-sm">
            {highestMoveCount > 0 && (
              <div>Highest Move Count: {highestMoveCount}</div>
            )}
            {highestMoney > 0 && <div>Highest Money: ${highestMoney}</div>}
          </div>
        )}
        <div className="flex flex-col gap-3">
          <button onClick={props.onStart}>Start Game</button>
        </div>
      </div>
    </div>
  )
}
