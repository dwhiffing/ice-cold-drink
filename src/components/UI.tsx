import { ReactNode, useMemo, useCallback, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export const UI = ({ children }: { children: ReactNode }) => {
  const currentDockingIndex = useGameStore((s) => s.currentDockingIndex)
  const showDestinationModal = useGameStore((s) => s.showDestinationModal)
  const setShowDestinationModal = useGameStore((s) => s.setShowDestinationModal)
  const islands = useGameStore((s) => s.islands)
  const moveBoatToDock = useGameStore((s) => s.moveBoatToDock)
  const inventory = useGameStore((s) => s.inventory)
  const addToInventory = useGameStore((s) => s.addToInventory)
  const subtractFromInventory = useGameStore((s) => s.subtractFromInventory)

  const [localShowDestinationModal, setLocalShowDestinationModal] =
    useState(true)

  const handleSelect = useCallback(
    (idx: number) => {
      setShowDestinationModal(false)
      setLocalShowDestinationModal(true) // reset for next time
      moveBoatToDock(idx)
    },
    [setShowDestinationModal, moveBoatToDock],
  )

  // Memoize the destination islands using the neighbours property
  const destinationIslands = useMemo(() => {
    if (!islands || islands.length === 0) return []
    const neighbourIndices =
      islands && islands[currentDockingIndex]?.neighbours
        ? islands[currentDockingIndex].neighbours
        : []
    return neighbourIndices.map((idx) => {
      const island = islands[idx]
      const distance = Math.sqrt(
        Math.pow(island.x - islands[currentDockingIndex].x, 2) +
          Math.pow(island.y - islands[currentDockingIndex].y, 2),
      )
      return { island, idx, distance }
    })
  }, [islands, currentDockingIndex])

  // Memoize the list items for the modal
  const destinationListItems = useMemo(
    () =>
      destinationIslands.map(({ idx, distance }) => (
        <li key={idx} className="my-2">
          <button
            className="px-4 py-2 rounded-md border-none bg-green-600 text-white font-bold cursor-pointer text-lg flex items-center gap-3 hover:bg-green-700 transition"
            onClick={() => handleSelect(idx)}
          >
            Island {idx + 1}
            <span className="font-normal text-base opacity-80">
              ({Math.round(distance)} units)
            </span>
          </button>
        </li>
      )),
    [destinationIslands, handleSelect],
  )

  return (
    <div className="pointer-events-none absolute top-0 left-0 w-screen h-screen flex z-[100]">
      <div className="flex flex-col gap-1 text-white p-2">
        <div className="font-bold">Inventory:</div>
        {inventory.map((item) => (
          <div key={item.name} className="text-sm">
            {item.name.charAt(0).toUpperCase() + item.name.slice(1)}:{' '}
            {item.value}
          </div>
        ))}
        <div>Dock: {currentDockingIndex + 1}</div>
      </div>
      {showDestinationModal && !localShowDestinationModal && (
        <button
          className="pointer-events-auto fixed top-4 right-4 z-[201] bg-zinc-800 text-white px-4 py-2 rounded shadow hover:bg-zinc-700 transition"
          onClick={() => setLocalShowDestinationModal(true)}
        >
          Open Destination Modal
        </button>
      )}
      {showDestinationModal && localShowDestinationModal && (
        <div className="pointer-events-auto fixed inset-0 bg-black/70 flex items-center justify-center z-[200]">
          <div className="bg-zinc-900 text-white p-8 rounded-xl min-w-80 shadow-2xl text-center relative">
            <button
              className="absolute top-2 right-2 text-white bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-zinc-600 transition"
              onClick={() => setLocalShowDestinationModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">
              Select Destination Island
            </h2>
            <div className="mb-4">
              <div className="font-bold mb-2">Inventory Controls</div>
              {['food', 'fuel'].map((resource) => (
                <div
                  key={resource}
                  className="flex items-center justify-center gap-2 mb-2"
                >
                  <span className="w-12 text-right capitalize">
                    {resource}:
                  </span>
                  <button
                    className="px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600 text-lg font-bold"
                    onClick={() => subtractFromInventory(resource, 1)}
                  >
                    -
                  </button>
                  <span className="w-8 text-center">
                    {inventory.find((i) => i.name === resource)?.value ?? 0}
                  </span>
                  <button
                    className="px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600 text-lg font-bold"
                    onClick={() => addToInventory(resource, 1)}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
            <ul className="grid grid-cols-3 p-0 gap-4">
              {destinationListItems}
            </ul>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
