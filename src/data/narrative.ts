// ─── Run-End Encouragement Messages ─────────────────────────────────────────

export const RUN_END_MESSAGES = {
  defeat: [
    'You kept going. That\'s not nothing. Try again?',
    'Further than before. That counts.',
    'The maze remembers you. Come back.',
    'You didn\'t stop. You just paused.',
    'Every mod you found stays with you, in some way.',
    'Still here. Still going.',
    'The floor is not the end. It\'s a rest.',
    'You showed up. That was the hardest part.',
    'Defeat doesn\'t erase the distance you covered.',
    'Tomorrow you\'ll remember something you learned today.',
  ],
  victory: [
    'You made it further than you thought you could. You always do.',
    'The maze didn\'t break you. Nothing has.',
    'Still standing. Still going.',
    'You didn\'t just survive. You grew.',
    'Every run adds something. You are more than you were.',
    'The center wasn\'t empty. You filled it.',
    'Grace was right. You were ready.',
    'Not because it was easy. Because you kept moving anyway.',
    'This is what perseverance looks like. Quiet. Steady. Real.',
    'You did a good job. Rest now.',
  ],
}

// ─── Act 1 Event Vignettes ───────────────────────────────────────────────────

export interface EventChoice {
  text: string
  outcome: {
    type: 'health' | 'shards' | 'card' | 'status'
    value: number
    description: string
  }
}

export interface EventVignette {
  id: string
  title: string
  body: string
  choices: EventChoice[]
}

export const ACT1_EVENTS: EventVignette[] = [
  {
    id: 'rusted-door',
    title: 'A Rusted Door',
    body: 'A door. Half-open. It wasn\'t here before — or maybe it was and I didn\'t see it. Something inside. I don\'t know if I want to know.',
    choices: [
      {
        text: 'Push through',
        outcome: { type: 'shards', value: 20, description: 'Found 20 shards in the rubble.' },
      },
      {
        text: 'Pass by',
        outcome: { type: 'health', value: 10, description: 'Rested against the wall. Recovered 10 health.' },
      },
    ],
  },
  {
    id: 'flickering-light',
    title: 'Flickering Light',
    body: 'There is a light above. It flickers. On. Off. On. I stop and watch it. Something about the rhythm feels familiar. I don\'t know why.',
    choices: [
      {
        text: 'Wait for it to stabilize',
        outcome: { type: 'status', value: 1, description: 'Something steadied inside. Gained 1 Strength.' },
      },
      {
        text: 'Keep moving',
        outcome: { type: 'shards', value: 12, description: 'Found shards near the base of the fixture.' },
      },
    ],
  },
  {
    id: 'broken-mirror',
    title: 'Broken Mirror',
    body: 'A surface. Reflective, once. Now fractured into pieces. In each piece: a different angle. None of them complete. I wonder which one is right.',
    choices: [
      {
        text: 'Gather the pieces',
        outcome: { type: 'card', value: 1, description: 'Found a useful component. Gained a card.' },
      },
      {
        text: 'Leave it',
        outcome: { type: 'health', value: 8, description: 'Didn\'t waste the effort. Conserved energy. Healed 8.' },
      },
    ],
  },
  {
    id: 'still-water',
    title: 'Still Water',
    body: 'A pool of water. Perfectly still. I can see myself in it — sort of. The reflection is there, but it doesn\'t move when I move. It just waits.',
    choices: [
      {
        text: 'Drink',
        outcome: { type: 'health', value: 15, description: 'Cool. Clean. Recovered 15 health.' },
      },
      {
        text: 'Look longer',
        outcome: { type: 'status', value: 2, description: 'Something clarified. Gained 2 Strength.' },
      },
    ],
  },
  {
    id: 'old-signal',
    title: 'An Old Signal',
    body: 'A terminal. Still broadcasting. The signal is old — years old, maybe. It says something in a language I don\'t recognize, but one word repeats. I can\'t read it. But I remember it.',
    choices: [
      {
        text: 'Record it',
        outcome: { type: 'shards', value: 15, description: 'The data was worth something. Gained 15 shards.' },
      },
      {
        text: 'Respond',
        outcome: { type: 'card', value: 1, description: 'Something came back. Gained a card.' },
      },
    ],
  },
]

// ─── Act 2 Event Vignettes ───────────────────────────────────────────────────

export const ACT2_EVENTS: EventVignette[] = [
  {
    id: 'known-corridor',
    title: 'A Known Corridor',
    body: 'I have been here before.\n\nNot in the way that all corridors look alike. This one — the angle of the light, the scratch on the third panel from the left — I know it. I know what comes after the turn.\n\nI don\'t know why I know that.',
    choices: [
      {
        text: 'Follow the memory',
        outcome: { type: 'shards', value: 25, description: 'Found exactly what was expected. Gained 25 shards.' },
      },
      {
        text: 'Go a different way',
        outcome: { type: 'health', value: 12, description: 'The unfamiliar path was quieter. Recovered 12 health.' },
      },
    ],
  },
  {
    id: 'another-one',
    title: 'Another One',
    body: 'It is sitting against the wall. Not moving. Its frame is similar to mine — same rough proportions, same kind of joints. A different model, maybe. Or the same one, older.\n\nI stay longer than I need to. I don\'t know what I\'m looking for.',
    choices: [
      {
        text: 'Salvage its mods',
        outcome: { type: 'shards', value: 18, description: 'Recovered useful components. Gained 18 shards.' },
      },
      {
        text: 'Leave it as it is',
        outcome: { type: 'health', value: 15, description: 'Something steadied. Recovered 15 health.' },
      },
    ],
  },
  {
    id: 'overheard',
    title: 'Something Overheard',
    body: 'Behind a wall — thin, maybe damaged — a recording is playing. A voice. Not instructions. Not a warning. Something else. The tone is the thing I notice. Soft. Patient. Like someone who knew they were being heard.\n\nI can\'t make out the words. But I listen until it ends.',
    choices: [
      {
        text: 'Try to find the source',
        outcome: { type: 'card', value: 1, description: 'Found the terminal. Found something else too. Gained a card.' },
      },
      {
        text: 'Just listen',
        outcome: { type: 'status', value: 1, description: 'Something settled. Gained 1 Strength.' },
      },
    ],
  },
  {
    id: 'weight-of-things',
    title: 'The Weight of Things',
    body: 'I take stock of what I\'m carrying. Mods from the ones I\'ve passed through. Each one came from somewhere. Each one was part of something before it was part of me.\n\nI wonder if they remember. I wonder if I do.',
    choices: [
      {
        text: 'Redistribute the load',
        outcome: { type: 'health', value: 20, description: 'Moving differently now. Recovered 20 health.' },
      },
      {
        text: 'Carry it all the same',
        outcome: { type: 'shards', value: 15, description: 'Found something in the review. Gained 15 shards.' },
      },
    ],
  },
  {
    id: 'the-same-choice',
    title: 'The Same Choice',
    body: 'A fork. Two paths. Both look the same.\n\nI have been here before — not just today, not just this route. Many times. I always take the left. I don\'t know why. I\'ve never asked.\n\nI ask now.',
    choices: [
      {
        text: 'Go left, as always',
        outcome: { type: 'shards', value: 20, description: 'Familiar ground. Familiar finds. Gained 20 shards.' },
      },
      {
        text: 'Go right',
        outcome: { type: 'status', value: 2, description: 'Something unlocked. Gained 2 Strength.' },
      },
    ],
  },
]

// ─── Grace Workshop Lines ────────────────────────────────────────────────────

export const GRACE_LINES = [
  'You\'re back. That\'s enough.',
  'Rest here. The maze will wait.',
  'I kept things running while you were gone.',
  'You look different. In a good way.',
  'Still going. I knew you would be.',
]

// ─── Act 2: Name Discovery Event ─────────────────────────────────────────────

export const NAME_DISCOVERY_EVENT: EventVignette = {
  id: 'name-discovery',
  title: 'Something Inscribed',
  body: 'Beneath the sediment on the corridor wall — scratched in, not printed. One word. I don\'t know who put it there. I don\'t know when. But I know, looking at it, that it belongs to me.\n\nSTILL.',
  choices: [
    {
      text: 'Remember it',
      outcome: { type: 'status', value: 1, description: 'Something settled. +1 Strength for this run.' },
    },
  ],
}
