export const DEBUG = true
export const FOG_DISTANCE = 60
export const DUR = 1000
export const PRIMARY_COLOR = '#557582'

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
        label: 'Open it (gain food)',
        onSelect: (store) => store.addToInventory('food', 2),
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
