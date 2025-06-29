export const DEBUG = true
export const FOG_DISTANCE = 600000
export const STARTING_ISLAND = 9
export const TIMESCALE = 5
export const DUR = 1000
export const BOAT_SPEED = 0.0005 * TIMESCALE
export const BOAT_ROTATE_SPEED = 0.01 * TIMESCALE
export const FUEL_UNIT_DISTANCE = 200
export const NEIGHBOUR_DISTANCE = 600
export const PRIMARY_COLOR = '#557582'

export const ISLAND_NAMES = [
  'Azure Atoll',
  'Borealis Bay',
  'Garnet Grotto',
  'Ivory Isle',
  "Kraken's Key",
  'Lapis Lagoon',
  'Port Peregrine',
  'Riptide Rock',
  'Silver Shoals',
  'Wake of Whispers',
]

export interface EncounterOption {
  label: string
  onSelect: (store: import('../store/gameStore').GameState) => void
}

export interface Encounter {
  text: string
  options: EncounterOption[]
}

export const ENCOUNTERS: Encounter[] = [
  {
    text: 'You find a floating crate. What do you do?',
    options: [
      {
        label: 'Open it (gain fuel)',
        onSelect: (store) => store.addToInventory('fuel', 2),
      },
      { label: 'Ignore it', onSelect: () => {} },
    ],
  },
  {
    text: 'A sudden storm appears. What do you do?',
    options: [
      {
        label: 'Wait it out (lose fuel)',
        onSelect: (store) => store.subtractFromInventory('fuel', 1),
      },
      { label: 'Sail through (no effect)', onSelect: () => {} },
    ],
  },
  // Add more encounters as desired
]
