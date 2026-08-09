import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GameLog from '../GameLog.jsx'

const players = [
  { name: 'Human', sub: 'human', bot: false },
  { name: 'Bot1', sub: 'bot1', bot: true }
]
const playerColorMap = ['playerColor0', 'playerColor1']
const items = {
  heal: { name: 'Heal', description: 'Heal 2', cost: 3, type: 'discard' },
  energize: { name: 'Energize', description: 'Gain energy', cost: 4, type: 'keep' }
}

describe('GameLog', () => {
  it('renders null when empty', () => {
    const { container } = render(<GameLog gameLog={[]} players={players} playerColorMap={playerColorMap} items={items} />)
    expect(container.innerHTML).toBe('')
  })

  it('renders startTurn log', () => {
    const log = [{ template: 'startTurn', playerIndex: 0, roll: ['A','H','$','1','2','3'] }]
    render(<GameLog gameLog={log} players={players} playerColorMap={playerColorMap} items={items} />)
    expect(screen.getByText(/Start/)).toBeInTheDocument()
    expect(screen.getByText('Human')).toBeInTheDocument()
    expect(screen.getByText('play_arrow')).toBeInTheDocument()
  })

  it('renders multiple templates', () => {
    const log = [
      { template: 'score', playerIndex: 1, score: 2 },
      { template: 'heal', playerIndex: 0, healAmount: 2 },
      { template: 'buy', playerIndex: 0, itemName: 'heal' },
      { template: 'attack', attacker: 0, defender: 1, damage: 3 }
    ]
    render(<GameLog gameLog={log} players={players} playerColorMap={playerColorMap} items={items} />)
    expect(screen.getByText(/scored 2 points/)).toBeInTheDocument()
    expect(screen.getByText(/gained 2 health/)).toBeInTheDocument()
    expect(screen.getByText(/bought Heal/)).toBeInTheDocument()
    expect(screen.getByText(/attacked/)).toBeInTheDocument()
  })

  it('renders death and botsWin', () => {
    const log = [
      { template: 'death', playerIndex: 1 },
      { template: 'botsWin' },
      { template: 'leaveHill', playerIndex: 0 }
    ]
    render(<GameLog gameLog={log} players={players} playerColorMap={playerColorMap} items={items} />)
    expect(screen.getByText(/died/)).toBeInTheDocument()
    expect(screen.getByText(/robots have killed/)).toBeInTheDocument()
    expect(screen.getByText(/left the hill/)).toBeInTheDocument()
  })

  it('renders icons for each template', () => {
    const templates = [
      { template: 'startTurn', playerIndex: 0, roll: ['1','2','3'] },
      { template: 'money', playerIndex: 0, money: 2 },
      { template: 'damage', playerIndex: 0, damage: 1 }
    ]
    render(<GameLog gameLog={templates} players={players} playerColorMap={playerColorMap} items={items} />)
    expect(screen.getByText('play_arrow')).toBeInTheDocument()
    expect(screen.getByText('attach_money')).toBeInTheDocument()
    expect(screen.getByText('sick')).toBeInTheDocument()
  })
})
