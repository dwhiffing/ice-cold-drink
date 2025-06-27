import { DUR, PRIMARY_COLOR } from '../utils/constants'

export function Menu(props: {
  onStart: () => void
  gameState: 'win' | 'lose' | ''
  fade: boolean
}) {
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
      <div className="flex flex-col items-center gap-4">
        <h3 className="text-3xl font-bold">Red Dot Game</h3>
        <p>
          {props.gameState === 'lose'
            ? 'You lose!'
            : props.gameState === 'win'
            ? 'You win!'
            : ''}
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={props.onStart}>Start Game</button>
        </div>
      </div>
    </div>
  )
}
