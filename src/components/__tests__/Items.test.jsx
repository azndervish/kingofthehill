import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Items from '../Items.jsx'

const items = {
  heal: { name: 'Heal', description: 'Heal 2 damage', cost: 3, type: 'discard', discard: () => {} },
  energize: { name: 'Energize', description: 'Gain 1 energy', cost: 4, type: 'keep' },
  sweep: { name: 'Sweep', description: 'Sweep the shop', cost: 1, type: 'discard' }
}

function makeGame(phase = 'PHASE_BUY', isMyTurn = true, over = false, sale = ['heal','energize']) {
  return {
    players: [{ name: 'Human', sub: 'human', bot: false, money: 5, health: 10, maxHealth: 10, points: 0, items: [] }],
    item: { sale, deck: [], discard: [] },
    phase,
    over
  }
}

describe('Items', () => {
  it('renders items for sale title', () => {
    const game = makeGame()
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getByText('Items for Sale')).toBeInTheDocument()
  })

  it('renders item names, descriptions and types', () => {
    const game = makeGame()
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getByText('Heal')).toBeInTheDocument()
    expect(screen.getByText('Heal 2 damage')).toBeInTheDocument()
    expect(screen.getByText('Type: discard')).toBeInTheDocument()
    expect(screen.getByText('Energize')).toBeInTheDocument()
    expect(screen.getByText('Sweep')).toBeInTheDocument()
    // sweep has no type
    expect(screen.getByText('Type: keep')).toBeInTheDocument()
  })

  it('shows Buy button when can buy and my turn', () => {
    const game = makeGame('PHASE_BUY', true, false, ['heal'])
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getAllByText('Buy').length).toBeGreaterThan(0)
  })

  it('shows block icon when cannot buy (not enough money)', () => {
    const game = makeGame('PHASE_BUY', true, false, ['heal'])
    // make money 0
    game.players[0].money = 0
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getAllByText('block').length).toBeGreaterThan(0)
  })

  it('shows block when not my turn', () => {
    const game = makeGame('PHASE_BUY', false, false, ['heal'])
    render(<Items game={game} items={items} isMyTurn={false} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getAllByText('block').length).toBeGreaterThan(0)
  })

  it('shows block when phase is not BUY', () => {
    const game = makeGame('PHASE_ROLL', true, false, ['heal'])
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getAllByText('block').length).toBeGreaterThan(0)
  })

  it('calls onBuy when Buy clicked', () => {
    const onBuy = vi.fn()
    const game = makeGame('PHASE_BUY', true, false, ['heal'])
    render(<Items game={game} items={items} isMyTurn={true} onBuy={onBuy} awaitUpdate={false} />)
    fireEvent.click(screen.getAllByText('Buy')[0])
    expect(onBuy).toHaveBeenCalledWith('heal')
  })

  it('disables Buy when awaitUpdate', () => {
    const game = makeGame('PHASE_BUY', true, false, ['heal'])
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={true} />)
    expect(screen.getAllByText('Buy')[0].closest('button')).toBeDisabled()
  })

  it('handles missing item gracefully', () => {
    const game = makeGame('PHASE_BUY', true, false, ['nonexistent'])
    render(<Items game={game} items={items} isMyTurn={true} onBuy={vi.fn()} awaitUpdate={false} />)
    expect(screen.getByText('Items for Sale')).toBeInTheDocument()
  })
})
