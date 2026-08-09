import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GamePlayers from '../GamePlayers.jsx'

const items = {
  heal: { name: 'Heal', description: 'Heal 2 damage', cost: 3, type: 'discard' },
  energize: { name: 'Energize', description: 'Energize description', cost: 5, type: 'keep' }
}

function makeGame(overrides = {}) {
  const base = {
    players: [
      { name: 'Human', sub: 'human', bot: false, health: 10, maxHealth: 10, points: 5, money: 3, items: ['heal'] },
      { name: 'Bot1', sub: 'bot1', bot: true, health: 8, maxHealth: 10, points: 2, money: 2, items: [] },
      { name: 'DeadBot', sub: 'bot2', bot: true, health: 0, maxHealth: 10, points: 0, money: 0, items: [] }
    ],
    playersOnHill: [0],
    maxHillSpots: 2,
    currentPlayer: { playerIndex: 0, roll: ['A','H','$','1','2','3'], usedRerolls: 0 },
    gameLog: [],
    over: false
  }
  return { ...base, ...overrides }
}

describe('GamePlayers', () => {
  it('renders hill and everyone else sections', () => {
    const game = makeGame()
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('King of the Hill')).toBeInTheDocument()
    expect(screen.getByText('Everyone Else')).toBeInTheDocument()
  })

  it('shows empty slot when hill not full', () => {
    const game = makeGame()
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('Empty')).toBeInTheDocument()
    expect(screen.getByText('block')).toBeInTheDocument()
  })

  it('renders player details with hearts, points and money', () => {
    const game = makeGame()
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('Human')).toBeInTheDocument()
    expect(screen.getByText('Bot1')).toBeInTheDocument()
    expect(screen.getByText('5 Points')).toBeInTheDocument()
    expect(screen.getByText('$ 3')).toBeInTheDocument()
    // hearts are rendered via Rating with favorite icon - check at least one favorite text
    expect(screen.getAllByText('favorite').length).toBeGreaterThan(0)
  })

  it('renders items for player', () => {
    const game = makeGame()
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('Heal')).toBeInTheDocument()
    expect(screen.getByText('Heal 2 damage')).toBeInTheDocument()
    expect(screen.getByText('star')).toBeInTheDocument()
  })

  it('shows current player star', () => {
    const game = makeGame()
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('stars')).toBeInTheDocument()
  })

  it('renders dead players strikethrough', () => {
    const game = makeGame()
    const { container } = render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText(/DeadBot/)).toBeInTheDocument()
    // dead player uses class dead
    expect(container.querySelector('.dead')).not.toBeNull()
  })

  it('handles no current player', () => {
    const game = makeGame({ currentPlayer: undefined })
    render(<GamePlayers game={game} items={items} playerColorMap={['playerColor0','playerColor1','playerColor2']} />)
    expect(screen.getByText('Human')).toBeInTheDocument()
  })
})
