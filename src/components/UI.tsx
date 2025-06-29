import { ReactNode, useMemo, useCallback, useState, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const DURATION = 1000
export const UI = ({ children }: { children: ReactNode }) => {
  const inventory = useGameStore((s) => s.inventory)
  const money = useGameStore((s) => s.money)

  return (
    <div className="pointer-events-none absolute top-0 left-0 w-screen h-screen flex z-[100]">
      <div className="flex flex-col gap-1 text-white p-2">
        <div className="text-sm font-bold">Money: ${money}</div>
        {inventory.map((item) => (
          <div key={item.name} className="text-sm">
            {item.name.charAt(0).toUpperCase() + item.name.slice(1)}:{' '}
            {item.value}
          </div>
        ))}
      </div>

      <DestinationModal />
      <EncounterModal />
      {children}
    </div>
  )
}

export const DestinationModal = () => {
  const currentDockingIndex = useGameStore((s) => s.currentDockingIndex)
  const showDestinationModal = useGameStore((s) => s.showDestinationModal)
  const setShowDestinationModal = useGameStore((s) => s.setShowDestinationModal)
  const islands = useGameStore((s) => s.islands)
  const moveBoatToDock = useGameStore((s) => s.moveBoatToDock)
  const inventory = useGameStore((s) => s.inventory)
  const money = useGameStore((s) => s.money)
  const set = useGameStore

  const [localShowDestinationModal, setLocalShowDestinationModal] =
    useState(true)
  const [lastContent, setLastContent] = useState<{
    islands: typeof islands
    inventory: typeof inventory
  } | null>(null)

  // Cache last content when modal is open and has content
  useEffect(() => {
    if (
      showDestinationModal &&
      localShowDestinationModal &&
      islands &&
      islands.length > 0 &&
      inventory &&
      inventory.length > 0
    ) {
      setLastContent({ islands, inventory })
    }
  }, [showDestinationModal, localShowDestinationModal, islands, inventory])

  // Memoize the destination islands using the neighbours property
  const destinationIslands = useMemo(() => {
    const srcIslands =
      showDestinationModal && localShowDestinationModal
        ? islands
        : lastContent?.islands
    if (!srcIslands || srcIslands.length === 0) return []
    const _island = srcIslands[currentDockingIndex]
    const neighbourIndices =
      srcIslands && _island?.neighbours ? _island.neighbours : []

    return neighbourIndices.map((idx) => {
      const island = srcIslands[idx]
      const distance = Math.sqrt(
        Math.pow(island.x + island.offsetX - (_island.x + _island.offsetX), 2) +
          Math.pow(
            island.y + island.offsetZ - (_island.y + _island.offsetZ),
            2,
          ),
      )
      return { island, idx, distance }
    })
  }, [
    showDestinationModal,
    localShowDestinationModal,
    islands,
    currentDockingIndex,
    lastContent,
  ])

  const handleSelect = useCallback(
    (idx: number) => {
      setShowDestinationModal(false)
      setLocalShowDestinationModal(true)
      setTimeout(() => {
        moveBoatToDock(idx)
      }, DURATION / 2)
    },
    [setShowDestinationModal, moveBoatToDock],
  )

  // Memoize the list items for the modal
  const destinationListItems = useMemo(
    () =>
      destinationIslands.map(({ island, idx, distance }) => (
        <li key={idx} className="my-2">
          <button
            className="px-4 py-2 rounded-md border-none bg-green-600 text-white font-bold cursor-pointer text-lg flex items-center gap-1 hover:bg-green-700 transition"
            onClick={() => handleSelect(idx)}
          >
            {island.name}
            <span className="font-normal text-base opacity-80">
              {Math.round(distance / 100)} km
            </span>
          </button>
        </li>
      )),
    [destinationIslands, handleSelect],
  )

  const isOpen = showDestinationModal && localShowDestinationModal
  const displayInventory = isOpen ? inventory : lastContent?.inventory || []

  const currentIsland = islands[currentDockingIndex]

  const handleBuy = (resource: string) => {
    const price = currentIsland?.prices?.[resource] || 10
    if (money >= price) {
      set.getState().addToInventory(resource, 1)
      set.setState((state) => ({ money: state.money - price }))
    }
  }
  const handleSell = (resource: string) => {
    const price = currentIsland?.prices?.[resource] || 10
    const amount = inventory.find((i) => i.name === resource)?.value ?? 0
    if (amount > 0) {
      set.getState().subtractFromInventory(resource, 1)
      set.setState((state) => ({ money: state.money + price }))
    }
  }

  return (
    <>
      <button
        className="pointer-events-auto absolute top-4 right-4 px-2 py-1 bg-zinc-700 rounded hover:bg-zinc-600 text-lg font-bold"
        onClick={() => setLocalShowDestinationModal(true)}
      >
        Show Destinations
      </button>
      <div
        className={`${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'
        } transition-opacity fixed inset-0 bg-black/70 flex items-center justify-center z-[200]`}
        style={{ transitionDuration: `${DURATION}ms` }}
      >
        <div className="bg-zinc-900 text-white p-8 rounded-xl min-w-80 shadow-2xl text-center relative">
          <button
            className="absolute top-2 right-2 text-white bg-zinc-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-zinc-600 transition"
            onClick={() => setLocalShowDestinationModal(false)}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-2xl font-bold mb-4">
            {islands[currentDockingIndex].name}
          </h2>
          <div className="mb-4">
            {inventory
              .map((item) => item.name)
              .map((resource) => {
                let color = ''
                let price = currentIsland?.prices?.[resource] ?? 0
                const quantity =
                  displayInventory.find((i) => i.name === resource)?.value ?? 0
                if (resource === currentIsland?.cheapResource) {
                  color = 'text-green-400 font-bold'
                  price = Math.round(price / 3)
                }
                if (resource === currentIsland?.expensiveResource) {
                  color = 'text-red-400 font-bold'
                  price = Math.round(price * 3)
                }

                return (
                  <div
                    key={resource}
                    className={`flex items-center justify-center gap-2 mb-2 ${color}`}
                  >
                    <span className="w-12 text-right capitalize">
                      {resource
                        .replace('commodity_', 'Commodity ')
                        .replace('fuel', 'Fuel')}
                      :
                    </span>
                    <span className="w-16 text-yellow-300 text-xs">
                      Price: {price}
                    </span>
                    <button
                      className="px-2 py-1 bg-red-700 rounded hover:bg-red-600 text-lg font-bold"
                      onClick={() => handleSell(resource)}
                    >
                      Sell
                    </button>
                    <span className="w-8 text-center">{quantity}</span>
                    <button
                      className="px-2 py-1 bg-green-700 rounded hover:bg-green-600 text-lg font-bold"
                      onClick={() => handleBuy(resource)}
                    >
                      Buy
                    </button>
                  </div>
                )
              })}
          </div>
          <h2 className="text-lg font-bold mb-2">Select Destination</h2>
          <ul className="flex gap-4">{destinationListItems}</ul>
        </div>
      </div>
    </>
  )
}

export const EncounterModal = () => {
  const encounterModal = useGameStore((s) => s.encounterModal)
  const [lastContent, setLastContent] = useState(encounterModal)

  // Update cache when modal is open and has content
  useEffect(() => {
    if (
      encounterModal &&
      (encounterModal.text ||
        (encounterModal.options && encounterModal.options.length > 0))
    ) {
      setLastContent(encounterModal)
    }
  }, [encounterModal])

  const isOpen = !!encounterModal
  const displayContent = isOpen ? encounterModal : lastContent

  return (
    <div
      className={`${
        isOpen ? 'pointer-events-auto' : 'pointer-events-none opacity-0'
      } transition-opacity fixed inset-0 bg-black/70 flex items-center justify-center z-[300]`}
      style={{ transitionDuration: `${DURATION}ms` }}
    >
      <div className="bg-zinc-900 text-white p-8 rounded-xl min-w-80 shadow-2xl text-center relative">
        <h2 className="text-xl font-bold mb-4">Encounter</h2>
        <div className="mb-4">{displayContent?.text}</div>
        <div className="flex flex-col gap-2">
          {displayContent?.options?.map((opt, i) => (
            <button
              key={i}
              className="px-4 py-2 rounded-md border-none bg-blue-600 text-white font-bold cursor-pointer text-lg hover:bg-blue-700 transition"
              onClick={opt.onSelect}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
